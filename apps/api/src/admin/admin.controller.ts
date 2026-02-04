/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  Post,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { DocumentsService } from '../documents/documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentDto } from '../documents/dto/upload-document.dto';
import { DocType } from '@trusttax/database';
import { AdminGuard } from '../auth/admin.guard';
import { RequestOrderDocumentDto } from './dto/request-order-document.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private documentsService: DocumentsService,
  ) { }

  @Get('clients')
  async getAllClients() {
    return this.adminService.getAllClients();
  }

  @Get('staff')
  async getStaff() {
    return this.adminService.getStaff();
  }

  @Get('clients/:id/sensitive')
  async getClientSensitive(@Param('id') id: string) {
    return this.adminService.getClientSensitiveData(id);
  }

  @Get('clients/:id')
  async getClientDetails(@Param('id') id: string) {
    return this.adminService.getClientDetails(id);
  }

  @Post('clients/:id/test-push')
  async sendTestPush(@Param('id') id: string) {
    return this.adminService.sendTestPush(id);
  }

  @Get('orders')
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('orders/:id')
  async getOrderDetails(@Param('id') id: string) {
    return this.adminService.getOrderDetails(id);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updateOrderStatus(id, body.status, body.notes);
  }

  @Post('orders/:id/timeline')
  async addOrderTimelineEntry(
    @Param('id') id: string,
    @Body() body: { title: string; description: string },
  ) {
    return this.adminService.addOrderTimelineEntry(
      id,
      body.title,
      body.description,
    );
  }

  @Post('orders/:id/approvals')
  async createOrderApproval(
    @Param('id') id: string,
    @Body() body: { type: string; title: string; description?: string },
  ) {
    return this.adminService.createOrderApproval(
      id,
      body.type,
      body.title,
      body.description,
    );
  }

  @Post('orders/:id/request-document')
  async requestOrderDocument(
    @Param('id') id: string,
    @Body() body: RequestOrderDocumentDto,
  ) {
    return this.adminService.requestOrderDocument(id, body);
  }

  @Get('dashboard/metrics')
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  // Services Management
  @Get('services')
  async getAllServices() {
    return this.adminService.getAllServices();
  }

  @Get('services/:id')
  async getServiceById(@Param('id') id: string) {
    return this.adminService.getServiceById(id);
  }

  @Post('services')
  async createService(
    @Body()
    body: {
      name?: string;
      description?: string;
      nameI18n?: { en?: string; es?: string };
      descriptionI18n?: { en?: string; es?: string };
      category: string;
      price: number;
      originalPrice?: number;
    },
  ) {
    return this.adminService.createService(body);
  }

  @Put('services/:id')
  async updateService(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      nameI18n?: { en?: string; es?: string };
      descriptionI18n?: { en?: string; es?: string };
      category?: string;
      price?: number;
      originalPrice?: number;
    },
  ) {
    return this.adminService.updateService(id, body);
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: string) {
    return this.adminService.deleteService(id);
  }

  // Service Steps
  @Post('services/:id/steps')
  async createServiceStep(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string; formConfig?: any },
  ) {
    return this.adminService.createServiceStep(id, body);
  }

  @Put('services/steps/:stepId')
  async updateServiceStep(
    @Param('stepId') stepId: string,
    @Body() body: { title?: string; description?: string; formConfig?: any },
  ) {
    return this.adminService.updateServiceStep(stepId, body);
  }

  @Delete('services/steps/:stepId')
  async deleteServiceStep(@Param('stepId') stepId: string) {
    return this.adminService.deleteServiceStep(stepId);
  }

  @Put('services/steps/reorder')
  async reorderServiceSteps(@Body() body: { stepIds: string[] }) {
    return this.adminService.reorderServiceSteps(body.stepIds);
  }

  // Client Document Management
  @Get('clients/:id/documents')
  async getClientDocuments(
    @Param('id') id: string,
    @Query('type') type?: DocType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.documentsService.findUserDocuments(id, {
      type,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Post('clients/:id/documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadClientDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.uploadDocument(id, file, dto);
  }

  @Delete('clients/:userId/documents/:docId')
  async removeClientDocument(
    @Param('userId') userId: string,
    @Param('docId') docId: string,
  ) {
    return this.documentsService.deleteDocument(userId, docId);
  }

  @Delete('clients/:id')
  async deleteClient(@Param('id') id: string) {
    try {
      return await this.adminService.deleteClient(id);
    } catch (error: any) {
      // Ensure frontend receives a useful message instead of a generic 500
      throw new HttpException(
        {
          message:
            error?.message || 'Error al eliminar el cliente. Revisa los logs.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
