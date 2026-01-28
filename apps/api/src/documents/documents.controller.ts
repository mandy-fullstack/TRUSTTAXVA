import { Controller, Post, Get, UseGuards, Request, UploadedFile, UseInterceptors, Body, Delete, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Request() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('title') title: string,
        @Body('type') type: string
    ) {
        return this.documentsService.uploadDocument(req.user.userId, file, title, type);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any) {
        return this.documentsService.findUserDocuments(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async remove(@Request() req: any, @Param('id') id: string) {
        const result = await this.documentsService.deleteDocument(req.user.userId, id);
        if (!result) throw new NotFoundException('Document not found');
        return result;
    }
}
