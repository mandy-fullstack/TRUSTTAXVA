import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsModule } from '../documents/documents.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [DocumentsModule, OrdersModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule { }

