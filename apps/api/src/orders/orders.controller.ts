import { Controller, Post, Get, Body, UseGuards, Request, Param, NotFoundException, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async create(@Request() req: any, @Body() body: { serviceId: string; metadata?: any }) {
        return this.ordersService.create(req.user.userId, body.serviceId, body.metadata);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any) {
        if (!req.user || !req.user.userId) {
            console.error('[OrdersController] User not authenticated properly', req.user);
            throw new NotFoundException('User not authenticated properly');
        }
        return this.ordersService.findAllByUser(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.ordersService.findOne(req.user.userId, id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('approvals/:approvalId')
    async respondToApproval(
        @Request() req: any,
        @Param('approvalId') approvalId: string,
        @Body() body: { status: 'APPROVED' | 'REJECTED'; clientNote?: string }
    ) {
        return this.ordersService.respondToApproval(req.user.userId, approvalId, body.status, body.clientNote);
    }
}
