import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll() {
        return this.servicesService.findAll();
    }

    @Get('top-reviews')
    async getTopReviews() {
        return this.servicesService.getTopReviews();
    }

    @Get(':id/reviews')
    async getServiceReviews(@Param('id') id: string) {
        return this.servicesService.getServiceReviews(id);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const service = await this.servicesService.findOne(id);
        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }
}
