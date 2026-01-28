import { Controller, Get, Param, Patch, Body, UseGuards, Request, Post, Put, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('clients')
    async getAllClients(@Request() req: any) {
        // Verify admin role
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
}
