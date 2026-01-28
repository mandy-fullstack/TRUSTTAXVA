import { Controller, Post, Get, UseGuards, Request, UploadedFile, UseInterceptors, Body, Delete, Param, Patch, Query, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocType } from '@trusttax/database';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Request() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto
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
        @Body() dto: UpdateDocumentDto
    ) {
        return this.documentsService.updateMetadata(req.user.userId, id, dto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        return this.documentsService.deleteDocument(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/download')
    async getDownloadUrl(@Request() req: any, @Param('id') id: string) {
        const url = await this.documentsService.getSignedUrl(req.user.userId, id);
        return { url };
    }
}
