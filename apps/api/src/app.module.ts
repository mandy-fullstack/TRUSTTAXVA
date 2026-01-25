import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [AuthModule, ServicesModule, AdminModule, CompanyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
