import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { ServicesModule } from '../services/services.module'; // for prisma provider if exported, or just import PrismaModule

// Assuming PrismaService is global or in a Shared Module, but usually we import the module providing it.
// In this project, PrismaService is provided in ServicesModule or typically a clean PrismaModule.
// Looking at other modules, AdminModule imports PrismaService from specific file.
// We must provide PrismaService or import a module that exports it.

// Let's import PrismaService directly and add to providers to be safe, like AdminModule likely does.
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule { }
