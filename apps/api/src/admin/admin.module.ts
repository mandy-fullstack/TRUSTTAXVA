import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';

import { ChatModule } from '../chat/chat.module';
import { DocumentsModule } from '../documents/documents.module';
import { EmailModule } from '../email/email.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ChatModule, DocumentsModule, EmailModule, OrdersModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
