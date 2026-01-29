
import { Controller, Get, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll(@Request() req: any) {
        return this.invoicesService.findAllByUser(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.invoicesService.findOne(req.user.userId, id);
    }
}
