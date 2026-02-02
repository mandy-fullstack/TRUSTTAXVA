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
        console.warn(
          '[StorageService] Firebase Admin not initialized. Operational failure expected.',
        );
        const appsList =
          admin.apps.map((app) => app?.name).join(', ') || 'None';
        throw new Error(
          `Firebase Admin not initialized. Apps: ${appsList}. Please check FirebaseService initialization.`,
        );
      }

      // Log initialization context
      console.log(
        `[StorageService] Initializing with ProjectID: ${projectId}, EnvBucket: ${bucketName}`,
      );

      if (!bucketName && projectId) {
        // Try to auto-resolve. Most modern projects use .firebasestorage.app
        // but older ones use .appspot.com
        bucketName = `${projectId}.firebasestorage.app`;
        console.log(
          `[StorageService] No bucket provided, attempting default: ${bucketName}`,
        );
      }

      if (!bucketName) {
        console.error(
          '[StorageService] Critical: STORAGE CONFIGURATION MISSING',
        );
        throw new Error('Firebase Storage configuration missing (Bucket Name)');
      }

      try {
        this.bucket = admin.storage().bucket(bucketName);
        console.log(
          `[StorageService] Successfully resolved bucket instance: ${bucketName}`,
        );
      } catch (error: any) {
        console.error(
          `[StorageService] Failed to resolve bucket ${bucketName}:`,
          error,
        );
        throw error;
      }
    }
    return this.bucket;
  }

  async uploadFile(
    file: Express.Multer.File,
    path: string,
    isPublic: boolean = false,
    customFileName?: string,
  ): Promise<{
    url: string;
    fileName: string;
    size: number;
    mimeType: string;
  }> {
    try {
      console.log('[StorageService] uploadFile called');
      console.log('  Path:', path);
      console.log('  Custom filename:', customFileName);
      console.log('  File buffer size:', file.buffer.length);
      console.log('  File mimetype:', file.mimetype);

      const bucket = this.getBucket();
      console.log('[StorageService] Bucket obtained:', bucket.name);

      // Use custom name if provided, otherwise default to uuid-original
      const finalName = customFileName || `${uuidv4()}-${file.originalname}`;
      const fileName = `${path}/${finalName}`;
      console.log('[StorageService] Full file path:', fileName);

      const fileUpload = bucket.file(fileName);

      console.log('[StorageService] Starting file.save()...');
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });
      console.log('[StorageService] ✅ File saved successfully');

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

      console.log('[StorageService] ✅ Upload complete, URL generated');

      return {
        url,
        fileName: fileName, // Store the FULL path (path + uuid + originalname)
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error: any) {
      console.error('[StorageService] ❌ Upload failed:', error);
      console.error('[StorageService] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 500),
      });
      throw new Error(`Storage upload failed: ${error.message}`);
    }
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

  async getFileBuffer(fileName: string): Promise<Buffer> {
    const bucket = this.getBucket();
    const file = bucket.file(fileName);
    try {
      const [buffer] = await file.download();
      return buffer;
    } catch (error: any) {
      console.error(
        `[StorageService] Failed to download file: ${fileName}`,
        error,
      );
      if (error.code === 404 || error.message?.includes('No such object')) {
        // Debug: List files in the directory to see what exists
        const dir = fileName.split('/').slice(0, -1).join('/');
        try {
          console.log(
            `[StorageService] Debug: Listing files in directory '${dir}'...`,
          );
          const [files] = await bucket.getFiles({ prefix: dir });
          console.log(
            `[StorageService] Found ${files.length} files in '${dir}':`,
          );
          files.forEach((f: any) => console.log(` - ${f.name}`));
        } catch (listError) {
          console.warn(
            '[StorageService] Failed to list debug files:',
            listError,
          );
        }
      }
      throw error;
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(fileName);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        console.log(`[StorageService] Successfully deleted file: ${fileName}`);
      } else {
        console.warn(
          `[StorageService] Attempted to delete non-existent file: ${fileName}`,
        );
      }
    } catch (error: any) {
      // If it's a 404, we don't want to crash, but other errors might be important
      if (error.code === 404) {
        console.warn(
          `[StorageService] File not found during deletion (404): ${fileName}`,
        );
        return;
      }
      console.error(
        `[StorageService] Failed to delete file ${fileName}:`,
        error,
      );
      throw error;
    }
  }
}
