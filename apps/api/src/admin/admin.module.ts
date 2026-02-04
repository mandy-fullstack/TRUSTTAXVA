import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';

import { ChatModule } from '../chat/chat.module';
import { DocumentsModule } from '../documents/documents.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ChatModule, DocumentsModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, EncryptionService],
})
export class AdminModule {}
