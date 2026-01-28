import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class DocumentsService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
    ) { }

    async uploadDocument(
        userId: string,
        file: Express.Multer.File,
        title: string,
        type: any = 'OTHER'
    ) {
        // 1. Upload to Firebase Storage
        const uploadResult = await this.storageService.uploadFile(
            file,
            `users/${userId}/documents`
        );

        // 2. Create record in Database
        return this.prisma.document.create({
            data: {
                title: title || file.originalname,
                type: type,
                url: uploadResult.url,
                s3Key: uploadResult.fileName, // We use s3Key field to store the filename/path in storage
                mimeType: uploadResult.mimeType,
                size: uploadResult.size,
                userId: userId,
            },
        });
    }

    async findUserDocuments(userId: string) {
        const documents = await this.prisma.document.findMany({
            where: { userId },
            orderBy: { uploadedAt: 'desc' },
        });

        // Refresh signed URLs if needed (since they expire in 7 days)
        return Promise.all(documents.map(async (doc: any) => {
            if (doc.s3Key) {
                const url = await this.storageService.getSignedUrl(doc.s3Key);
                return { ...doc, url };
            }
            return doc;
        }));
    }

    async deleteDocument(userId: string, id: string) {
        const doc = await this.prisma.document.findFirst({
            where: { id, userId },
        });

        if (!doc) return null;

        if (doc.s3Key) {
            await this.storageService.deleteFile(doc.s3Key);
        }

        return this.prisma.document.delete({
            where: { id },
        });
    }
}
