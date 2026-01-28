import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private bucket: any;

    constructor() {
        // The Firebase Admin SDK must be initialized before using storage
    }

    private getBucket() {
        if (!this.bucket) {
            const projectId = process.env.FIREBASE_PROJECT_ID;
            const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
            this.bucket = admin.storage().bucket(bucketName);
        }
        return this.bucket;
    }

    async uploadFile(
        file: Express.Multer.File,
        path: string,
        isPublic: boolean = false
    ): Promise<{ url: string; fileName: string; size: number; mimeType: string }> {
        const bucket = this.getBucket();
        const fileName = `${path}/${uuidv4()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
            },
        });

        let url: string;
        if (isPublic) {
            // Make file public if needed
            await fileUpload.makePublic();
            url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        } else {
            // Generate a signed URL that expires in 1 week
            const [signedUrl] = await fileUpload.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });
            url = signedUrl;
        }

        return {
            url,
            fileName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        };
    }

    async getSignedUrl(fileName: string): Promise<string> {
        const bucket = this.getBucket();
        const file = bucket.file(fileName);

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return url;
    }

    async deleteFile(fileName: string): Promise<void> {
        const bucket = this.getBucket();
        await bucket.file(fileName).delete();
    }
}
