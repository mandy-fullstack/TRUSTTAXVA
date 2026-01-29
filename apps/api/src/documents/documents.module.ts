import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';

import { EncryptionService } from '../common/services/encryption.service';

@Module({
    controllers: [DocumentsController],
    providers: [DocumentsService, PrismaService, EncryptionService],
    exports: [DocumentsService],
})
export class DocumentsModule { }
