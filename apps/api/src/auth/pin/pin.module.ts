import { Module } from '@nestjs/common';
import { PinController } from './pin.controller';
import { PinService } from './pin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [PinController],
  providers: [PinService],
  exports: [PinService],
})
export class PinModule { }
