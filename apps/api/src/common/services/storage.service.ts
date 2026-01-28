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
            let bucketName = process.env.FIREBASE_STORAGE_BUCKET;

            if (admin.apps.length === 0) {
                console.warn('[StorageService] Firebase Admin not initialized. Operational failure expected.');
                const appsList = admin.apps.map(app => app?.name).join(', ') || 'None';
                throw new Error(`Firebase Admin not initialized. Apps: ${appsList}. Please check FirebaseService initialization.`);
            }

            // Log initialization context
            console.log(`[StorageService] Initializing with ProjectID: ${projectId}, EnvBucket: ${bucketName}`);

            if (!bucketName && projectId) {
                // Try to auto-resolve. Most modern projects use .firebasestorage.app
                // but older ones use .appspot.com
                bucketName = `${projectId}.firebasestorage.app`;
                console.log(`[StorageService] No bucket provided, attempting default: ${bucketName}`);
            }

            if (!bucketName) {
                console.error('[StorageService] Critical: STORAGE CONFIGURATION MISSING');
                throw new Error('Firebase Storage configuration missing (Bucket Name)');
            }

            try {
                this.bucket = admin.storage().bucket(bucketName);
                console.log(`[StorageService] Successfully resolved bucket instance: ${bucketName}`);
            } catch (error: any) {
                console.error(`[StorageService] Failed to resolve bucket ${bucketName}:`, error);
                throw error;
            }
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
            fileName: fileName, // Store the FULL path (path + uuid + originalname)
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
