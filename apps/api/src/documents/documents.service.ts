import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocType } from '@trusttax/database';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class DocumentsService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
        private encryptionService: EncryptionService,
    ) { }

    async uploadDocument(
        userId: string,
        file: Express.Multer.File,
        dto: UploadDocumentDto
    ) {
        try {
            // Get user details for renaming
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });

            if (!user) throw new NotFoundException('User not found');

            // 1. Prepare standardized filename
            // Format: YEAR_DOCTYPE_FIRSTNAME_LASTNAME.ext.enc (Adding .enc to indicate encryption)
            const year = new Date().getFullYear();
            const fName = (user.firstName || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9]/g, '');
            const lName = (user.lastName || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9]/g, '');
            const docType = dto.type || 'DOCUMENT';
            const originalExt = file.originalname.split('.').pop() || 'bin';

            // Add .enc extension
            const newFileName = `${year}_${docType}_${fName}_${lName}.${originalExt}.enc`;

            // 2. Encrypt the file buffer
            const encryptedBuffer = this.encryptionService.encryptBuffer(file.buffer);

            // 3. Prepare encrypted file object
            const encryptedFile = {
                ...file,
                buffer: encryptedBuffer,
                originalname: newFileName,
                mimetype: 'application/octet-stream', // Force encrypted binary type
                size: encryptedBuffer.length
            };

            // 4. Determine folder
            let folder = 'other';
            console.log('Processing upload for type:', dto.type); // DEBUG LOG

            if (dto.type) {
                // Ensure type is treated as string for comparison
                const typeStr = String(dto.type);
                if (typeStr === 'DRIVER_LICENSE') {
                    folder = 'dl';
                } else {
                    folder = typeStr.toLowerCase();
                }
            }

            console.log('Determined target folder:', folder); // DEBUG LOG
            const storagePath = `users/${userId}/documents/${folder}`;
            console.log('Full Storage Path:', storagePath); // DEBUG LOG

            // 5. Upload to Firebase Storage
            const uploadResult = await this.storageService.uploadFile(
                encryptedFile,
                storagePath,
                false, // isPublic (false for documents)
                newFileName
            );

            // 6. Create record in Database
            return this.prisma.document.create({
                data: {
                    title: dto.title || newFileName.replace('.enc', ''), // Title without .enc for display
                    type: dto.type || DocType.OTHER,
                    url: uploadResult.url, // This URL points to the ENCRYPTED file
                    s3Key: uploadResult.fileName,
                    mimeType: file.mimetype, // Store ORIGINAL mimeType for decryption/display
                    size: file.size, // Store ORIGINAL size
                    userId: userId,
                    taxReturnId: dto.taxReturnId,
                    immigrationCaseId: dto.immigrationCaseId,
                    orderId: dto.orderId,
                    conversationId: dto.conversationId,
                },
            });
        } catch (error: any) {
            console.error('Error in uploadDocument service:', error);
            throw new InternalServerErrorException(
                `Error uploading document: ${error.message}`
            );
        }
    }

    async findUserDocuments(userId: string, filters?: { type?: DocType, limit?: number, offset?: number }) {
        const { type, limit = 50, offset = 0 } = filters || {};

        const where: any = { userId };
        if (type) where.type = type;

        const documents = await this.prisma.document.findMany({
            where,
            orderBy: { uploadedAt: 'desc' },
            take: limit,
            skip: offset,
        });

        // Return proxy URLs
        return documents.map((doc: any) => {
            // We return a proxy URL that the frontend can use (with auth)
            // or if we switch the frontend to fetch blob, we might not strictly need 'url' here 
            // but it helps to have a reference.
            // Note: Since we encrypt, we CANNOT give a direct Storage URL.
            return {
                ...doc,
                url: `/api/documents/${doc.id}/content`
            };
        });
    }

    async findOne(userId: string, id: string) {
        const doc = await this.prisma.document.findUnique({
            where: { id },
        });

        if (!doc) throw new NotFoundException('Document not found');
        if (doc.userId !== userId) throw new ForbiddenException('You do not have permission to access this document');

        if (doc.s3Key) {
            const url = await this.storageService.getSignedUrl(doc.s3Key);
            return { ...doc, url };
        }
        return doc;
    }

    async updateMetadata(userId: string, id: string, dto: UpdateDocumentDto) {
        const doc = await this.prisma.document.findFirst({
            where: { id, userId },
        });

        if (!doc) throw new NotFoundException('Document not found');

        return this.prisma.document.update({
            where: { id },
            data: dto,
        });
    }

    async deleteDocument(userId: string, id: string) {
        const doc = await this.prisma.document.findFirst({
            where: { id, userId },
        });

        if (!doc) throw new NotFoundException('Document not found');

        if (doc.s3Key) {
            await this.storageService.deleteFile(doc.s3Key);
        }

        return this.prisma.document.delete({
            where: { id },
        });
    }

    async downloadDecryptedDocument(userId: string, id: string) {
        const doc = await this.findOne(userId, id);

        if (!doc.s3Key) {
            throw new NotFoundException('Document file not found');
        }

        try {
            // 1. Download encrypted buffer
            const encryptedBuffer = await this.storageService.getFileBuffer(doc.s3Key);

            // 2. Decrypt buffer
            const decryptedBuffer = this.encryptionService.decryptBuffer(encryptedBuffer);

            return {
                buffer: decryptedBuffer,
                mimeType: doc.mimeType,
                filename: doc.title // or construct from s3Key
            };
        } catch (error) {
            console.error('Error downloading/decrypting document:', error);
            throw new InternalServerErrorException('Failed to retrieve document');
        }
    }

    async getSignedUrl(userId: string, id: string) {
        // Should preferably use downloadDecryptedDocument via controller instead of direct URL
        // But keeping this if needed for non-encrypted generic files?
        // For now, encryption is enforced, so this might return garbage if used directly.
        // We should probably rely on the controller proxy.
        const doc = await this.findOne(userId, id);
        if (!doc.s3Key) throw new Error('Document has no storage key');
        return this.storageService.getSignedUrl(doc.s3Key);
    }
}
