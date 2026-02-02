import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EncryptionService } from './services/encryption.service';
import { AuditService } from './services/audit.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EncryptionService, AuditService],
  exports: [EncryptionService, AuditService],
})
export class SharedModule {}
