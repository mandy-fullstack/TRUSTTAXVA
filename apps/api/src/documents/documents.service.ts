import { Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocType } from '@trusttax/database';

@Injectable()
export class DocumentsService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
    ) { }

    async uploadDocument(
        userId: string,
        file: Express.Multer.File,
        dto: UploadDocumentDto
    ) {
        try {
            // 1. Upload to Firebase Storage
            const uploadResult = await this.storageService.uploadFile(
                file,
                `users/${userId}/documents`
            );

            // 2. Create record in Database with all associations
            return this.prisma.document.create({
                data: {
                    title: dto.title || file.originalname,
                    type: dto.type || DocType.OTHER,
                    url: uploadResult.url,
                    s3Key: uploadResult.fileName,
                    mimeType: uploadResult.mimeType,
                    size: uploadResult.size,
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
                `Error al subir documento: ${error.message || 'Error inesperado en el servidor de almacenamiento'}`
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

        // Refresh signed URLs
        return Promise.all(documents.map(async (doc: any) => {
            if (doc.s3Key) {
                const url = await this.storageService.getSignedUrl(doc.s3Key);
                return { ...doc, url };
            }
            return doc;
        }));
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

    async getSignedUrl(userId: string, id: string) {
        const doc = await this.findOne(userId, id);
        if (!doc.s3Key) throw new Error('Document has no storage key');
        return this.storageService.getSignedUrl(doc.s3Key);
    }
}
