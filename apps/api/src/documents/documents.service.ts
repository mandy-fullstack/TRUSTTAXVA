import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/services/storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocType } from '@trusttax/database';
import { EncryptionService } from '../common/services/encryption.service';
import { EmailService } from '../email/email.service';
import { ChatGateway } from '../chat/chat.gateway';
import { AiService } from '../common/services/ai.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private encryptionService: EncryptionService,
    private emailService: EmailService,
    private chatGateway: ChatGateway,
    private aiService: AiService,
  ) {}

  async analyzeW2(userId: string, id: string) {
    // 1. Get document and verify ownership
    const doc = await this.findOne(userId, id);

    if (!doc.s3Key) {
      throw new NotFoundException('Document file not found (no s3Key)');
    }

    try {
      console.log(`[analyzeW2] Fetching doc: ${doc.title} (${doc.mimeType})`);

      // 2. Download encrypted buffer
      const encryptedBuffer = await this.storageService.getFileBuffer(
        doc.s3Key,
      );
      console.log(
        `[analyzeW2] Downloaded buffer: ${encryptedBuffer.length} bytes`,
      );

      // 3. Decrypt
      let buffer = encryptedBuffer;
      if (doc.s3Key.endsWith('.enc')) {
        buffer = this.encryptionService.decryptBuffer(encryptedBuffer);
        console.log(`[analyzeW2] Decrypted buffer: ${buffer.length} bytes`);
      }

      // 4. Validate MIME Type for AI
      let mimeType = doc.mimeType;
      if (
        mimeType === 'application/octet-stream' &&
        doc.title.toLowerCase().endsWith('.pdf')
      ) {
        console.warn(
          '[analyzeW2] Correcting MIME type from octet-stream to application/pdf',
        );
        mimeType = 'application/pdf';
      }
      if (
        mimeType === 'application/octet-stream' &&
        (doc.title.toLowerCase().endsWith('.jpg') ||
          doc.title.toLowerCase().endsWith('.jpeg'))
      ) {
        mimeType = 'image/jpeg';
      }
      if (
        mimeType === 'application/octet-stream' &&
        doc.title.toLowerCase().endsWith('.png')
      ) {
        mimeType = 'image/png';
      }

      // 5. Send to AI
      return this.aiService.extractW2Data(buffer, mimeType);
    } catch (error: any) {
      console.error('Error analyzing W-2:', error);

      // Enhanced Debugging for 404s
      if (error.code === 404 || error.message?.includes('No such object')) {
        // ... existing 404 logic ...
        try {
          const bucket = this.storageService['getBucket']();
          const dir = doc.s3Key.split('/').slice(0, -1).join('/');
          const [files] = await bucket.getFiles({ prefix: dir });
          const fileList = files.map((f: any) => f.name).join(', ');
          throw new InternalServerErrorException(
            `File not found: ${doc.s3Key}. Available in dir: ${fileList}`,
          );
        } catch (listErr) {
          // Fallback if listing fails
          if (listErr instanceof InternalServerErrorException) throw listErr;
          throw new InternalServerErrorException(
            `File not found: ${doc.s3Key}`,
          );
        }
      }

      throw new InternalServerErrorException(
        `AI Analysis failed: ${error.message}`,
      );
    }
  }

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    try {
      // Get user details for renaming
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      if (!user) throw new NotFoundException('User not found');

      // 1. Prepare standardized filename
      // Format: YEAR_DOCTYPE_FIRSTNAME_LASTNAME.ext.enc (Adding .enc to indicate encryption)
      const year = new Date().getFullYear();
      const fName = (user.firstName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const lName = (user.lastName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
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
        size: encryptedBuffer.length,
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
        newFileName,
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
        `Error uploading document: ${error.message}`,
      );
    }
  }

  async adminUploadDocument(
    adminId: string,
    userId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (!user) throw new NotFoundException('User not found');

      // 1. Prepare standardized filename
      const year = new Date().getFullYear();
      const fName = (user.firstName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const lName = (user.lastName || 'UNKNOWN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const docType = dto.type || 'DOCUMENT';
      const originalExt = file.originalname.split('.').pop() || 'bin';

      // Add .enc extension
      const newFileName = `${year}_${docType}_${fName}_${lName}_ADMIN.${originalExt}.enc`;

      // 2. Encrypt buffer
      const encryptedBuffer = this.encryptionService.encryptBuffer(file.buffer);

      // 3. Prepare encrypted file object
      const encryptedFile = {
        ...file,
        buffer: encryptedBuffer,
        originalname: newFileName,
        mimetype: 'application/octet-stream',
        size: encryptedBuffer.length,
      };

      // 4. Determine folder
      let folder = 'admin_uploads';
      if (dto.type) {
        folder = String(dto.type).toLowerCase();
      }

      const storagePath = `users/${userId}/documents/${folder}`;

      // 5. Upload to Storage
      const uploadResult = await this.storageService.uploadFile(
        encryptedFile,
        storagePath,
        false,
        newFileName,
      );

      // 6. Create record
      const doc = await this.prisma.document.create({
        data: {
          title: dto.title || newFileName.replace('.enc', ''),
          type: dto.type || DocType.OTHER,
          url: uploadResult.url,
          s3Key: uploadResult.fileName,
          mimeType: file.mimetype,
          size: file.size,
          userId: userId, // Document belongs to the CLIENT
          taxReturnId: dto.taxReturnId,
          immigrationCaseId: dto.immigrationCaseId,
          orderId: dto.orderId,
          // Track that admin uploaded it? Maybe in future schema update.
        },
      });

      // 7. NOTIFICATIONS
      // Send Email
      this.emailService
        .sendDocumentUploaded(
          user.email,
          doc.title,
          user.firstName || undefined,
        )
        .catch((err) => console.error('Failed to send upload email:', err));

      // Emit Socket Event
      // Emit to specific user room: "user_{userId}"
      this.chatGateway.server.to(`user_${userId}`).emit('document_received', {
        id: doc.id,
        title: doc.title,
        type: doc.type,
        uploadedAt: doc.uploadedAt,
        fromAdmin: true,
      } as any); // Type cast if strictly typed

      return doc;
    } catch (error: any) {
      console.error('Error in adminUploadDocument:', error);
      throw new InternalServerErrorException(
        `Error uploading document: ${error.message}`,
      );
    }
  }

  // --- Admin / Internal Methods ---

  async findById(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async adminFindUserDocuments(userId: string) {
    // Reuse the logic but without limit/offset for now for admins (or add later)
    return this.findUserDocuments(userId, { limit: 100 });
  }

  async adminDownloadDocument(id: string) {
    try {
      const doc = await this.findById(id);

      if (!doc.s3Key) {
        console.error(`[adminDownloadDocument] Document ${id} has no s3Key`);
        throw new NotFoundException('Document file not found (no storage key)');
      }

      console.log(
        `[adminDownloadDocument] Fetching document ${id} with s3Key: ${doc.s3Key}`,
      );

      let fileBuffer: Buffer;
      try {
        fileBuffer = await this.storageService.getFileBuffer(doc.s3Key);
        console.log(
          `[adminDownloadDocument] Downloaded ${fileBuffer.length} bytes`,
        );
      } catch (storageError: any) {
        console.error(
          `[adminDownloadDocument] Storage error for ${doc.s3Key}:`,
          storageError,
        );
        throw new NotFoundException(
          `Document file not found in storage: ${storageError.message || 'Unknown error'}`,
        );
      }

      let finalBuffer = fileBuffer;
      if (doc.s3Key.endsWith('.enc')) {
        try {
          console.log(`[adminDownloadDocument] Decrypting buffer...`);
          finalBuffer = this.encryptionService.decryptBuffer(fileBuffer);
          console.log(
            `[adminDownloadDocument] Decrypted to ${finalBuffer.length} bytes`,
          );
        } catch (decErr: any) {
          console.error(
            `[adminDownloadDocument] Decryption failed for document ${doc.id}:`,
            decErr,
          );
          throw new InternalServerErrorException(
            `Failed to decrypt document: ${decErr.message || 'Decryption error'}`,
          );
        }
      }

      // Ensure mimeType is valid
      let mimeType = doc.mimeType || 'application/octet-stream';

      // Fix common mimeType issues
      if (mimeType === 'application/octet-stream') {
        const titleLower = (doc.title || '').toLowerCase();
        if (titleLower.endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (
          titleLower.endsWith('.jpg') ||
          titleLower.endsWith('.jpeg')
        ) {
          mimeType = 'image/jpeg';
        } else if (titleLower.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (titleLower.endsWith('.gif')) {
          mimeType = 'image/gif';
        } else if (titleLower.endsWith('.webp')) {
          mimeType = 'image/webp';
        }
      }

      const filename =
        doc.title || doc.s3Key.replace('.enc', '') || `document-${id}`;

      return {
        buffer: finalBuffer,
        mimeType: mimeType,
        filename: filename,
      };
    } catch (error: any) {
      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error(
        `[adminDownloadDocument] Unexpected error for document ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve document: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // --- User Methods ---

  async findUserDocuments(
    userId: string,
    filters?: { type?: DocType; limit?: number; offset?: number },
  ) {
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
      return {
        ...doc,
        url: `/documents/${doc.id}/content`,
      };
    });
  }

  async findOne(userId: string, id: string) {
    const doc = await this.findById(id);
    if (doc.userId !== userId)
      throw new ForbiddenException(
        'You do not have permission to access this document',
      );

    // Always return proxy URL instead of direct Firebase Storage URL
    return {
      ...doc,
      url: `/documents/${doc.id}/content`,
    };
  }

  async updateMetadata(userId: string, id: string, dto: UpdateDocumentDto) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.document.update({
      where: { id },
      data: dto,
    });
  }

  async deleteDocument(userId: string, id: string) {
    // Verify ownership
    const doc = await this.findOne(userId, id);

    if (doc.s3Key) {
      await this.storageService.deleteFile(doc.s3Key);
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async adminDeleteDocument(id: string) {
    const doc = await this.findById(id);

    if (doc.s3Key) {
      await this.storageService.deleteFile(doc.s3Key);
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  async adminUpdateMetadata(id: string, dto: UpdateDocumentDto) {
    await this.findById(id); // verify existence

    return this.prisma.document.update({
      where: { id },
      data: dto,
    });
  }

  async downloadDecryptedDocument(userId: string, id: string) {
    try {
      const doc = await this.findOne(userId, id); // check ownership

      if (!doc.s3Key) {
        console.error(
          `[downloadDecryptedDocument] Document ${id} has no s3Key`,
        );
        throw new NotFoundException('Document file not found (no storage key)');
      }

      console.log(
        `[downloadDecryptedDocument] Fetching document ${id} with s3Key: ${doc.s3Key}`,
      );

      // 1. Download buffer
      let fileBuffer: Buffer;
      try {
        fileBuffer = await this.storageService.getFileBuffer(doc.s3Key);
        console.log(
          `[downloadDecryptedDocument] Downloaded ${fileBuffer.length} bytes`,
        );
      } catch (storageError: any) {
        console.error(
          `[downloadDecryptedDocument] Storage error for ${doc.s3Key}:`,
          storageError,
        );
        throw new NotFoundException(
          `Document file not found in storage: ${storageError.message || 'Unknown error'}`,
        );
      }

      // 2. Decrypt ONLY if it was encrypted (ends with .enc)
      // This supports legacy/unencrypted files
      let finalBuffer = fileBuffer;
      if (doc.s3Key.endsWith('.enc')) {
        try {
          console.log(`[downloadDecryptedDocument] Decrypting buffer...`);
          finalBuffer = this.encryptionService.decryptBuffer(fileBuffer);
          console.log(
            `[downloadDecryptedDocument] Decrypted to ${finalBuffer.length} bytes`,
          );
        } catch (decErr: any) {
          console.error(
            `[downloadDecryptedDocument] Decryption failed for document ${doc.id}:`,
            decErr,
          );
          throw new InternalServerErrorException(
            `Failed to decrypt document: ${decErr.message || 'Decryption error'}`,
          );
        }
      }

      // Ensure mimeType is valid
      let mimeType = doc.mimeType || 'application/octet-stream';

      // Fix common mimeType issues
      if (mimeType === 'application/octet-stream') {
        const titleLower = (doc.title || '').toLowerCase();
        if (titleLower.endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (
          titleLower.endsWith('.jpg') ||
          titleLower.endsWith('.jpeg')
        ) {
          mimeType = 'image/jpeg';
        } else if (titleLower.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (titleLower.endsWith('.gif')) {
          mimeType = 'image/gif';
        } else if (titleLower.endsWith('.webp')) {
          mimeType = 'image/webp';
        }
      }

      const filename =
        doc.title || doc.s3Key.replace('.enc', '') || `document-${id}`;

      return {
        buffer: finalBuffer,
        mimeType: mimeType,
        filename: filename,
      };
    } catch (error: any) {
      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error(
        `[downloadDecryptedDocument] Unexpected error for document ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Failed to retrieve document: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async getSignedUrl(userId: string, id: string) {
    const doc = await this.findOne(userId, id);
    if (!doc.s3Key) throw new Error('Document has no storage key');
    return this.storageService.getSignedUrl(doc.s3Key);
  }
}
