import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.service.findMany({
            where: { isActive: true },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.service.findUnique({
            where: { id },
            include: {
                steps: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        form: {
                            include: {
                                sections: { orderBy: { order: 'asc' }, include: { fields: { orderBy: { order: 'asc' } } } },
                                fields: { where: { sectionId: null }, orderBy: { order: 'asc' } }
                            }
                        }
                    }
                },
                docTypes: true,
                reviews: {
                    orderBy: { date: 'desc' }
                }
            }
        });
    }

    async getServiceReviews(serviceId: string) {
        return this.prisma.serviceReview.findMany({
            where: { serviceId },
            orderBy: { date: 'desc' }
        });
    }

    async getTopReviews(limit: number = 6) {
        return this.prisma.serviceReview.findMany({
            take: limit,
            orderBy: [{ rating: 'desc' }, { date: 'desc' }],
            include: {
                service: {
                    select: { name: true }
                }
            }
        });
    }
}
