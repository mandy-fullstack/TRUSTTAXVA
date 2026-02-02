import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  Param,
  Patch,
  Query,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocType } from '@trusttax/database';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.uploadDocument(req.user.userId, file, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(
    @Request() req: any,
    @Query('type') type?: DocType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.documentsService.findUserDocuments(req.user.userId, {
      type,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.findOne(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateMetadata(req.user.userId, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/content')
  async getContent(
    @Request() req: any,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      // Admin can access any document, regular users can only access their own
      const fileData =
        req.user.role === 'ADMIN'
          ? await this.documentsService.adminDownloadDocument(id)
          : await this.documentsService.downloadDecryptedDocument(
              req.user.userId,
              id,
            );

      if (!fileData || !fileData.buffer) {
        console.error(`[getContent] No file data returned for document ${id}`);
        return res.status(404).json({
          error: 'Document content not found',
          message: 'The document file could not be retrieved',
        });
      }

      // Ensure mimeType is set, default to application/octet-stream if missing
      const mimeType = fileData.mimeType || 'application/octet-stream';
      const filename = fileData.filename || `document-${id}`;

      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileData.buffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Access-Control-Allow-Origin': '*', // Allow CORS for images
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      res.send(fileData.buffer);
    } catch (error: any) {
      console.error(`[getContent] Error serving document ${id}:`, error);

      // Don't send response if headers already sent
      if (res.headersSent) {
        return;
      }

      const statusCode = error.status || 500;
      const message = error.message || 'Internal Server Error';

      res.status(statusCode).json({
        error: 'Failed to retrieve document',
        message: message,
        documentId: id,
      });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('analyze-w2/:id')
  async analyzeW2(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.analyzeW2(req.user.userId, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/download')
  async getDownloadUrl(@Request() req: any, @Param('id') id: string) {
    // Return URL to our content proxy
    // We can't generate a direct signed URL to storage because the file is encrypted there.
    // The frontend expects a URL. access_token needs to be handled?
    // Actually, if we use window.open(url), the browser request won't have the Bearer token header.
    // This is a common issue with secure file downloads.
    // Options:
    // 1. Frontend uses fetch(url, { headers: { Authorization... } }) -> gets blob -> creates object URL -> opens.
    // 2. We allow a temporary query token or cookie.
    //
    // Given existing frontend usage: window.open(doc.url)
    // We will need the frontend to change strategy OR provide a short-lived token.
    //
    // For now, let's keep this returning a URL that expects auth.
    // The frontend will fail if it just windows.open this without auth.
    //
    // Let's assume frontend calls getDocuments() which returns objects with 'url'.
    // We should update findUserDocuments to return the proxy URL.
    const url = `/documents/${id}/content`;
    return { url };
  }
  // --- Admin Endpoints ---

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/user/:userId')
  async adminGetUserDocuments(
    @Request() req: any,
    @Param('userId') userId: string,
  ) {
    // Simple role check
    if (req.user.role !== 'ADMIN')
      throw new ForbiddenException('Admin access required');

    const docs = await this.documentsService.adminFindUserDocuments(userId);
    // Map to admin download urls
    return docs.map((doc: any) => ({
      ...doc,
      url: `/documents/admin/download/${doc.id}`,
    }));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('admin/upload/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async adminUpload(
    @Request() req: any,
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (req.user.role !== 'ADMIN')
      throw new ForbiddenException('Admin access required');
    return this.documentsService.adminUploadDocument(
      req.user.userId,
      userId,
      file,
      dto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/download/:id')
  async adminDownload(
    @Request() req: any,
    @Param('id') id: string,
    @Query('disposition') disposition: string,
    @Res() res: Response,
  ) {
    if (req.user.role !== 'ADMIN')
      throw new ForbiddenException('Admin access required');

    const fileData = await this.documentsService.adminDownloadDocument(id);

    const contentDisposition =
      disposition === 'inline' ? 'inline' : 'attachment';

    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `${contentDisposition}; filename="${fileData.filename}"`,
      'Content-Length': fileData.buffer.length,
      'Access-Control-Allow-Origin': '*', // Allow CORS for images
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    res.send(fileData.buffer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('admin/:id')
  async adminUpdate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    if (req.user.role !== 'ADMIN')
      throw new ForbiddenException('Admin access required');
    return this.documentsService.adminUpdateMetadata(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('admin/:id')
  async adminRemove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN')
      throw new ForbiddenException('Admin access required');
    return this.documentsService.adminDeleteDocument(id);
  }
}
