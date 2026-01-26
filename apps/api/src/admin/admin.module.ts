import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';

@Module({
    controllers: [AdminController],
    providers: [AdminService, PrismaService, EncryptionService],
})
export class AdminModule { }
