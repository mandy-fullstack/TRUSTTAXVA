import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getAllClients() {
        const clients = await this.prisma.user.findMany({
            where: {
                role: 'CLIENT'
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                        invoices: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return clients;
    }

    async getClientDetails(clientId: string) {
        const client = await this.prisma.user.findUnique({
            where: { id: clientId },
            include: {
                orders: {
                    include: {
                        service: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                invoices: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!client) {
            throw new Error('Client not found');
        }

        const { password, ...clientData } = client;
        return clientData;
    }

    async getAllOrders() {
        const orders = await this.prisma.order.findMany({
            include: {
                service: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        price: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    }

    async getOrderDetails(orderId: string) {
        const order = await (this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        }) as any);

        if (!order) {
            throw new Error('Order not found');
        }

        return order;
    }

    async updateOrderStatus(orderId: string, status: string, notes?: string) {
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return order;
    }

    async getDashboardMetrics() {
        const [
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            totalRevenue
        ] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CLIENT' } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.order.count({ where: { status: 'COMPLETED' } }),
            this.prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.order.aggregate({
                _sum: {
                    total: true
                },
                where: {
                    status: 'COMPLETED'
                }
            } as any)
        ]);

        return {
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            totalRevenue: (totalRevenue as any)._sum?.total || 0
        };
    }

    // Services Management
    async getAllServices() {
        const services = await this.prisma.service.findMany({
            include: {
                _count: {
                    select: {
                        orders: true,
                        reviews: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return services;
    }

    async getServiceById(serviceId: string) {
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            include: {
                reviews: {
                    orderBy: {
                        date: 'desc'
                    }
                },
                steps: {
                    orderBy: {
                        orderIndex: 'asc'
                    }
                },
                _count: {
                    select: {
                        orders: true,
                        reviews: true
                    }
                }
            }
        });

        if (!service) {
            throw new Error('Service not found');
        }

        return service;
    }

    async createService(data: {
        name: string;
        description: string;
        category: string;
        price: number;
        originalPrice?: number;
    }) {
        const service = await this.prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                price: data.price,
                ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
            }
        });

        return service;
    }

    async updateService(serviceId: string, data: {
        name?: string;
        description?: string;
        category?: string;
        price?: number;
        originalPrice?: number;
    }) {
        const service = await this.prisma.service.update({
            where: { id: serviceId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description && { description: data.description }),
                ...(data.category && { category: data.category }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
            }
        });

        return service;
    }

    async deleteService(serviceId: string) {
        // Check if service has orders
        const ordersCount = await this.prisma.order.count({
            where: { serviceId }
        });

        if (ordersCount > 0) {
            throw new Error('Cannot delete service with existing orders');
        }

        // Delete reviews first
        await this.prisma.serviceReview.deleteMany({
            where: { serviceId }
        });

        // Delete steps
        await (this.prisma.client as any).serviceStep.deleteMany({
            where: { serviceId }
        });

        // Delete service
        await this.prisma.service.delete({
            where: { id: serviceId }
        });

        return { message: 'Service deleted successfully' };
    }

    // Service Steps Management
    async createServiceStep(serviceId: string, data: {
        title: string;
        description?: string;
        formConfig?: any;
    }) {
        // Get max order index
        const lastStep = await (this.prisma.client as any).serviceStep.findFirst({
            where: { serviceId },
            orderBy: { orderIndex: 'desc' }
        });
        const orderIndex = (lastStep?.orderIndex ?? -1) + 1;

        return (this.prisma.client as any).serviceStep.create({
            data: {
                serviceId,
                title: data.title,
                description: data.description || null,
                formConfig: data.formConfig || [], // Default empty array as JSON
                orderIndex
            }
        });
    }

    async updateServiceStep(stepId: string, data: {
        title?: string;
        description?: string;
        formConfig?: any;
    }) {
        return (this.prisma.client as any).serviceStep.update({
            where: { id: stepId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.formConfig && { formConfig: data.formConfig }),
            }
        });
    }

    async deleteServiceStep(stepId: string) {
        return (this.prisma.client as any).serviceStep.delete({
            where: { id: stepId }
        });
    }

    async reorderServiceSteps(stepIds: string[]) {
        // Transaction to update all steps
        return this.prisma.client.$transaction(
            stepIds.map((id, index) =>
                (this.prisma.client as any).serviceStep.update({
                    where: { id },
                    data: { orderIndex: index }
                })
            )
        );
    }
}
