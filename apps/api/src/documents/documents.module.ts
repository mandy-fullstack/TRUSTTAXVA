import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';

import { EncryptionService } from '../common/services/encryption.service';
import { StorageService } from '../common/services/storage.service';
import { EmailModule } from '../email/email.module';
import { ChatModule } from '../chat/chat.module';

import { AiModule } from '../common/services/ai.module';

@Module({
  imports: [EmailModule, ChatModule, AiModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
  ],
  exports: [DocumentsService],
})
export class DocumentsModule { }
