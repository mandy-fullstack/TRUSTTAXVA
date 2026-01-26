import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
    ) { }

    async getAllClients() {
        const clients = await this.prisma.user.findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                email: true,
                name: true,
                firstName: true,
                middleName: true,
                lastName: true,
                dateOfBirth: true,
                countryOfBirth: true,
                primaryLanguage: true,
                profileCompleted: true,
                taxIdType: true,
                ssnLast4: true,
                driverLicenseLast4: true,
                passportLast4: true,
                termsAcceptedAt: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { orders: true, invoices: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return clients;
    }

    async getClientDetails(clientId: string) {
        const client = await this.prisma.user.findUnique({
            where: { id: clientId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' as const },
                    include: { service: true }
                },
                invoices: {
                    orderBy: { createdAt: 'desc' as const }
                }
            }
        });

        if (!client) {
            throw new Error('Client not found');
        }

        const {
            password,
            ssnEncrypted,
            driverLicenseEncrypted,
            passportDataEncrypted,
            ...rest
        } = client;
        return rest;
    }

    async getClientSensitiveData(clientId: string): Promise<{
        ssn: string | null;
        driverLicense: { number: string; stateCode: string; stateName: string; expirationDate: string } | null;
        passport: { number: string; countryOfIssue: string; expirationDate: string } | null;
    }> {
        const user = await this.prisma.user.findUnique({
            where: { id: clientId },
            select: {
                ssnEncrypted: true,
                driverLicenseEncrypted: true,
                passportDataEncrypted: true,
            },
        });

        if (!user) {
            throw new Error('Client not found');
        }

        let ssn: string | null = null;
        let driverLicense: { number: string; stateCode: string; stateName: string; expirationDate: string } | null = null;
        let passport: { number: string; countryOfIssue: string; expirationDate: string } | null = null;

        try {
            if (user.ssnEncrypted) {
                ssn = this.encryptionService.decrypt(user.ssnEncrypted);
                console.log(`[AUDIT] Admin decrypted SSN for client ${clientId} at ${new Date().toISOString()}`);
            }
        } catch (e) {
            console.error('Failed to decrypt SSN for admin:', e);
        }

        try {
            if (user.driverLicenseEncrypted) {
                const raw = this.encryptionService.decrypt(user.driverLicenseEncrypted);
                if (raw) {
                    const dl = JSON.parse(raw);
                    driverLicense = {
                        number: dl.number ?? '',
                        stateCode: dl.stateCode ?? '',
                        stateName: dl.stateName ?? '',
                        expirationDate: dl.expirationDate ?? '',
                    };
                    console.log(`[AUDIT] Admin decrypted driver license for client ${clientId} at ${new Date().toISOString()}`);
                }
            }
        } catch (e) {
            console.error('Failed to decrypt driver license for admin:', e);
        }

        try {
            if (user.passportDataEncrypted) {
                const raw = this.encryptionService.decrypt(user.passportDataEncrypted);
                if (raw) {
                    const pp = JSON.parse(raw);
                    passport = {
                        number: pp.number ?? '',
                        countryOfIssue: pp.countryOfIssue ?? '',
                        expirationDate: pp.expirationDate ?? '',
                    };
                    console.log(`[AUDIT] Admin decrypted passport for client ${clientId} at ${new Date().toISOString()}`);
                }
            }
        } catch (e) {
            console.error('Failed to decrypt passport for admin:', e);
        }

        return { ssn, driverLicense, passport };
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

        return orders.map((o) => ({
            ...o,
            total: Number((o.service as { price: unknown }).price ?? 0),
        }));
    }

    async getOrderDetails(orderId: string) {
        const order = await this.prisma.order.findUnique({
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
        });

        if (!order) {
            throw new Error('Order not found');
        }

        const total = Number((order.service as { price?: unknown }).price ?? 0);
        return { ...order, total };
    }

    async updateOrderStatus(orderId: string, status: string, _notes?: string) {
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

        const total = Number((order.service as { price?: unknown }).price ?? 0);
        return { ...order, total };
    }

    async getDashboardMetrics() {
        const [
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            completedOrdersList
        ] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CLIENT' } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.order.count({ where: { status: 'COMPLETED' } }),
            this.prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.order.findMany({
                where: { status: 'COMPLETED' },
                include: { service: { select: { price: true } } }
            })
        ]);

        const totalRevenue = completedOrdersList.reduce(
            (sum, o) => sum + Number((o.service as { price: unknown }).price ?? 0),
            0
        );

        return {
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            totalRevenue
        };
    }

    // Services Management
    async getAllServices() {
        const services = await this.prisma.client.service.findMany({
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
        const service = await this.prisma.client.service.findUnique({
            where: { id: serviceId },
            include: {
                reviews: {
                    orderBy: {
                        date: 'desc'
                    }
                },
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
        const service = await this.prisma.client.service.create({
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
        const service = await this.prisma.client.service.update({
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

        // Use transaction to ensure all deletions happen atomically
        await this.prisma.client.$transaction(async (tx) => {
            // 1. Delete reviews
            await (tx as any).serviceReview.deleteMany({
                where: { serviceId }
            });

            // 2. Delete doc types - CRITICAL: must delete before service
            // Note: Schema has onDelete: Cascade, but we delete manually as backup
            try {
                // Try using raw SQL (most reliable method)
                await tx.$executeRawUnsafe(
                    `DELETE FROM "ServiceDoctype" WHERE "serviceId" = $1`,
                    serviceId
                );
            } catch (sqlError: any) {
                // If SQL fails, try with model (if available)
                try {
                    if ((tx as any).serviceDoctype) {
                        await (tx as any).serviceDoctype.deleteMany({
                            where: { serviceId }
                        });
                    }
                } catch (modelError: any) {
                    // If both fail, log but continue
                    // With onDelete: Cascade in schema, Prisma should handle it when deleting service
                    console.warn('Could not manually delete ServiceDoctype, relying on Cascade:', {
                        sqlError: sqlError.message,
                        modelError: modelError?.message
                    });
                }
            }

            // 3. Delete steps
            await (tx as any).serviceStep.deleteMany({
                where: { serviceId }
            });

            // 4. Delete service (this will fail if ServiceDoctype still exists)
            await tx.service.delete({
                where: { id: serviceId }
            });
        }, {
            timeout: 10000, // 10 second timeout
        });

        return { message: 'Service deleted successfully' };
    }

    // Service Steps Management
    async createServiceStep(serviceId: string, data: {
        title: string;
        description?: string;
        formConfig?: any;
        formId?: string | null;
    }) {
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
                formConfig: data.formId ? null : (data.formConfig ?? []),
                formId: data.formId || null,
                orderIndex
            }
        });
    }

    async updateServiceStep(stepId: string, data: {
        title?: string;
        description?: string;
        formConfig?: any;
        formId?: string | null;
    }) {
        const update: any = {};
        if (data.title != null) update.title = data.title;
        if (data.description !== undefined) update.description = data.description;
        if (data.formId !== undefined) {
            update.formId = data.formId || null;
            update.formConfig = data.formId ? null : (data.formConfig ?? []);
        } else if (data.formConfig !== undefined) {
            update.formConfig = data.formConfig;
        }
        return (this.prisma.client as any).serviceStep.update({
            where: { id: stepId },
            data: update
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
