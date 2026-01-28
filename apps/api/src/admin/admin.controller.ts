import { Controller, Get, Param, Patch, Body, UseGuards, Request, Post, Put, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { DocumentsService } from '../documents/documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadDocumentDto } from '../documents/dto/upload-document.dto';
import { DocType } from '@trusttax/database';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(
        private adminService: AdminService,
        private documentsService: DocumentsService
    ) { }

    @Get('clients')
    async getAllClients(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getAllClients();
    }

    @Get('clients/:id/sensitive')
    async getClientSensitive(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getClientSensitiveData(id);
    }

    @Get('clients/:id')
    async getClientDetails(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getClientDetails(id);
    }

    @Post('clients/:id/test-push')
    async sendTestPush(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.sendTestPush(id);
    }

    @Get('orders')
    async getAllOrders(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getAllOrders();
    }

    @Get('orders/:id')
    async getOrderDetails(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getOrderDetails(id);
    }

    @Patch('orders/:id/status')
    async updateOrderStatus(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { status: string; notes?: string }
    ) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.updateOrderStatus(id, body.status, body.notes);
    }

    @Post('orders/:id/timeline')
    async addOrderTimelineEntry(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { title: string; description: string }
    ) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.addOrderTimelineEntry(id, body.title, body.description);
    }

    @Post('orders/:id/approvals')
    async createOrderApproval(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { type: string; title: string; description?: string }
    ) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.createOrderApproval(id, body.type, body.title, body.description);
    }

    @Get('dashboard/metrics')
    async getDashboardMetrics(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getDashboardMetrics();
    }

    // Services Management
    @Get('services')
    async getAllServices(@Request() req: any) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getAllServices();
    }

    @Get('services/:id')
    async getServiceById(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.getServiceById(id);
    }

    @Post('services')
    async createService(@Request() req: any, @Body() body: {
        name?: string;
        description?: string;
        nameI18n?: { en?: string; es?: string };
        descriptionI18n?: { en?: string; es?: string };
        category: string;
        price: number;
        originalPrice?: number;
    }) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.createService(body);
    }

    @Put('services/:id')
    async updateService(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: {
            name?: string;
            description?: string;
            nameI18n?: { en?: string; es?: string };
            descriptionI18n?: { en?: string; es?: string };
            category?: string;
            price?: number;
            originalPrice?: number;
        }
    ) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.updateService(id, body);
    }

    @Delete('services/:id')
    async deleteService(@Request() req: any, @Param('id') id: string) {
        if (req.user.role !== 'ADMIN') {
            throw new Error('Unauthorized');
        }
        return this.adminService.deleteService(id);
    }

    // Service Steps
    @Post('services/:id/steps')
    async createServiceStep(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { title: string; description?: string; formConfig?: any }
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.adminService.createServiceStep(id, body);
    }

    @Put('services/steps/:stepId')
    async updateServiceStep(
        @Request() req: any,
        @Param('stepId') stepId: string,
        @Body() body: { title?: string; description?: string; formConfig?: any }
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.adminService.updateServiceStep(stepId, body);
    }

    @Delete('services/steps/:stepId')
    async deleteServiceStep(
        @Request() req: any,
        @Param('stepId') stepId: string
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.adminService.deleteServiceStep(stepId);
    }

    @Put('services/steps/reorder')
    async reorderServiceSteps(
        @Request() req: any,
        @Body() body: { stepIds: string[] }
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.adminService.reorderServiceSteps(body.stepIds);
    }

    // Client Document Management
    @Get('clients/:id/documents')
    async getClientDocuments(
        @Request() req: any,
        @Param('id') id: string,
        @Query('type') type?: DocType,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.documentsService.findUserDocuments(id, {
            type,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined,
        });
    }

    @Post('clients/:id/documents/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadClientDocument(
        @Request() req: any,
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.documentsService.uploadDocument(id, file, dto);
    }

    @Delete('clients/:userId/documents/:docId')
    async removeClientDocument(
        @Request() req: any,
        @Param('userId') userId: string,
        @Param('docId') docId: string
    ) {
        if (req.user.role !== 'ADMIN') throw new Error('Unauthorized');
        return this.documentsService.deleteDocument(userId, docId);
    }
}
