/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { StorageService } from '../common/services/storage.service';
import { ChatGateway } from '../chat/chat.gateway';
import { FirebaseService } from '../common/services/firebase.service';
import { EmailService } from '../email/email.service';
import { DocType } from '@trusttax/database';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
        private storageService: StorageService,
        private chatGateway: ChatGateway,
        private firebaseService: FirebaseService,
        private emailService: EmailService,
    ) { }

    async getAllClients() {
        const clients = await (this.prisma.user as any).findMany({
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
                fcmToken: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { orders: true, invoices: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return clients;
    }

    async getStaff() {
        const staff = await (this.prisma.user as any).findMany({
            where: {
                role: {
                    in: ['ADMIN', 'PREPARER'],
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { preparedAppointments: true, preparedTaxReturns: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return staff;
    }

    async getClientDetails(clientId: string) {
        const client = await (this.prisma.user as any).findUnique({
            where: { id: clientId },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' as const },
                    include: { service: true },
                },
                invoices: {
                    orderBy: { createdAt: 'desc' as const },
                },
            },
        });

        if (!client) {
            throw new Error('Client not found');
        }

        // Remove sensitive fields before returning
        const safeClient: any = { ...client };
        delete safeClient.password;
        delete safeClient.ssnEncrypted;
        delete safeClient.driverLicenseEncrypted;
        delete safeClient.passportDataEncrypted;

        return {
            ...safeClient,
            fcmToken: client.fcmToken,
        };
    }

    async getClientSensitiveData(clientId: string): Promise<{
        ssn: string | null;
        driverLicense: {
            number: string;
            stateCode: string;
            stateName: string;
            expirationDate: string;
        } | null;
        passport: {
            number: string;
            countryOfIssue: string;
            expirationDate: string;
        } | null;
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
        let driverLicense: {
            number: string;
            stateCode: string;
            stateName: string;
            expirationDate: string;
        } | null = null;
        let passport: {
            number: string;
            countryOfIssue: string;
            expirationDate: string;
        } | null = null;

        try {
            if (user.ssnEncrypted) {
                ssn = this.encryptionService.decrypt(user.ssnEncrypted);
                console.log(
                    `[AUDIT] Admin decrypted SSN for client ${clientId} at ${new Date().toISOString()}`,
                );
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
                    console.log(
                        `[AUDIT] Admin decrypted driver license for client ${clientId} at ${new Date().toISOString()}`,
                    );
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
                    console.log(
                        `[AUDIT] Admin decrypted passport for client ${clientId} at ${new Date().toISOString()}`,
                    );
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
                        price: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
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
                progress: {
                    orderBy: {
                        stepIndex: 'asc',
                    },
                },
                documents: true,
                approvals: {
                    orderBy: { createdAt: 'desc' },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                        firstName: true,
                        middleName: true,
                        lastName: true,
                        dateOfBirth: true,
                        countryOfBirth: true,
                        primaryLanguage: true,
                        ssnLast4: true,
                        driverLicenseLast4: true,
                        passportLast4: true,
                        taxIdType: true,
                    },
                },
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Admin always needs decrypted form data for processing and review
        // Decrypt all formData in progress entries for admin view
        if (order.progress && order.progress.length > 0) {
            for (const progressItem of order.progress as any[]) {
                if (progressItem.data?.formData) {
                    // Decrypt sensitive fields for admin review and processing
                    progressItem.data = {
                        ...progressItem.data,
                        formData: this.encryptionService.decryptSensitiveFields(
                            progressItem.data.formData,
                        ),
                    };
                }
            }
        }

        const total = Number((order.service as { price?: unknown }).price ?? 0);
        return { ...order, total };
    }

    /**
     * Admin: Solicitar un documento al cliente (se guarda en OrderApproval como DOCUMENT_REQUEST)
     * y se envía un email al usuario con un link directo a su Order Detail.
     */
    async requestOrderDocument(
        orderId: string,
        payload: { documentName: string; message?: string; docType?: DocType },
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                userId: true,
                displayId: true,
                user: {
                    select: {
                        email: true,
                        firstName: true,
                        lastName: true,
                        name: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const docType = payload.docType ?? DocType.OTHER;
        const description = JSON.stringify({
            message: payload.message || '',
            docType,
        });

        const approval = await this.prisma.orderApproval.create({
            data: {
                orderId,
                type: 'DOCUMENT_REQUEST',
                title: payload.documentName,
                description,
            },
        });

        await this.prisma.order.update({
            where: { id: orderId },
            data: { updatedAt: new Date() },
        });

        await this.prisma.orderTimeline.create({
            data: {
                orderId,
                title: `Documento solicitado: ${payload.documentName}`,
                description:
                    payload.message ||
                    `Se solicitó el documento: ${payload.documentName}`,
            },
        });

        // Notificación en tiempo real (socket + push)
        this.chatGateway.server.to(`user_${order.userId}`).emit('notification', {
            type: 'order',
            title: 'Documento requerido',
            body: `Por favor sube: ${payload.documentName}`,
            link: `/dashboard/orders/${orderId}`,
        });

        void this.triggerOrderPushNotification(
            order.userId,
            'Documento requerido',
            `Por favor sube: ${payload.documentName}`,
            `/orders/${orderId}`,
        );

        // Email (no debe bloquear el request si falla)
        try {
            const userEmail = order.user.email;
            const userName =
                order.user.firstName ||
                order.user.name ||
                userEmail.split('@')[0] ||
                'there';

            await this.emailService.sendOrderDocumentRequestEmail(userEmail, {
                userName,
                orderId,
                orderDisplayId: order.displayId || order.id.slice(0, 8),
                documentName: payload.documentName,
                message: payload.message || '',
                docType: String(docType),
            });
        } catch (e: any) {
            console.warn(
                '[AdminService] Failed to send document request email:',
                e?.message || e,
            );
        }

        return approval;
    }

    async updateOrderStatus(orderId: string, status: string, notes?: string) {
        const order = await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                notes: notes || undefined,
                updatedAt: new Date(),
            } as any,
            include: {
                service: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                timeline: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });

        // Add automatic timeline entry for status change
        await this.prisma.orderTimeline.create({
            data: {
                orderId,
                title: `Estado actualizado: ${status}`,
                description:
                    notes ||
                    `El estado de la orden ha sido cambiado a ${status.toLowerCase().replace('_', ' ')}.`,
            },
        });

        this.chatGateway.server.to(`user_${order.userId}`).emit('notification', {
            type: 'order',
            title: 'Actualización de Estado',
            body: `Tu orden ha cambiado a estado: ${status}`,
            link: `/dashboard/orders/${orderId}`,
        });

        // Trigger Push Notification
        void this.triggerOrderPushNotification(
            order.userId,
            'Actualización de Estado',
            `Tu orden ha cambiado a estado: ${status}`,
            `/orders/${orderId}`,
        );

        const total = Number((order.service as { price?: unknown }).price ?? 0);
        return { ...order, total };
    }

    addOrderTimelineEntry(
        orderId: string,
        title: string,
        description: string,
    ) {
        return this.prisma.orderTimeline.create({
            data: {
                orderId,
                title,
                description,
            },
        });
    }

    async createOrderApproval(
        orderId: string,
        type: string,
        title: string,
        description?: string,
    ) {
        const approval = await this.prisma.orderApproval.create({
            data: {
                orderId,
                type,
                title,
                description,
            },
        });

        // Touch the order timestamp so client picks up the change
        await this.prisma.order.update({
            where: { id: orderId },
            data: { updatedAt: new Date() },
        });

        // Add to timeline too
        await this.prisma.orderTimeline.create({
            data: {
                orderId,
                title: `Solicitud de Aprobación: ${title}`,
                description: `Se ha requerido tu aprobación para: ${description || title}`,
            },
        });

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true },
        });
        if (order) {
            this.chatGateway.server.to(`user_${order.userId}`).emit('notification', {
                type: 'order',
                title: 'Acción Requerida',
                body: `Se requiere tu aprobación: ${title}`,
                link: `/dashboard/orders/${orderId}`,
            });

            // Trigger Push Notification
            void this.triggerOrderPushNotification(
                order.userId,
                'Acción Requerida',
                `Se requiere tu aprobación: ${title}`,
                `/orders/${orderId}`,
            );
        }

        return approval;
    }

    private async triggerOrderPushNotification(
        userId: string,
        title: string,
        body: string,
        link: string,
    ) {
        try {
            const user = await (this.prisma.user as any).findUnique({
                where: { id: userId },
                select: { fcmToken: true },
            });

            if (user && user.fcmToken) {
                await this.firebaseService.sendPushNotification(
                    user.fcmToken,
                    title,
                    body,
                    {
                        type: 'order_update',
                        link,
                    },
                );
            }
        } catch (error) {
            console.error('Failed to send order push notification:', error);
        }
    }

    async getDashboardMetrics() {
        const [
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            completedOrdersList,
        ] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CLIENT' } }),
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'PENDING' } }),
            this.prisma.order.count({ where: { status: 'COMPLETED' } }),
            this.prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.order.findMany({
                where: { status: 'COMPLETED' },
                include: { service: { select: { price: true } } },
            }),
        ]);

        const totalRevenue = completedOrdersList.reduce(
            (sum, o) => sum + Number((o.service as { price: unknown }).price ?? 0),
            0,
        );

        return {
            totalClients,
            totalOrders,
            pendingOrders,
            completedOrders,
            activeOrders,
            totalRevenue,
        };
    }

    // Services Management
    async getAllServices() {
        const services = await this.prisma.client.service.findMany({
            include: {
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return services;
    }

    async getServiceById(serviceId: string) {
        const service = await this.prisma.client.service.findUnique({
            where: { id: serviceId },
            include: {
                reviews: {
                    orderBy: {
                        date: 'desc',
                    },
                },
                steps: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        form: {
                            include: {
                                sections: {
                                    orderBy: { order: 'asc' },
                                    include: { fields: { orderBy: { order: 'asc' } } },
                                },
                                fields: {
                                    where: { sectionId: null },
                                    orderBy: { order: 'asc' },
                                },
                            },
                        },
                    },
                },
                docTypes: true,
                _count: {
                    select: {
                        orders: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!service) {
            throw new Error('Service not found');
        }

        return service;
    }

    async createService(data: {
        name?: string;
        description?: string;
        nameI18n?: { en?: string; es?: string };
        descriptionI18n?: { en?: string; es?: string };
        category: string;
        price: number;
        originalPrice?: number;
    }) {
        // Si se proporciona nameI18n, usarlo; si no, usar name como fallback para ambos idiomas
        const nameI18n =
            data.nameI18n ||
            (data.name ? { en: data.name, es: data.name } : undefined);
        const descriptionI18n =
            data.descriptionI18n ||
            (data.description
                ? { en: data.description, es: data.description }
                : undefined);

        // Mantener name y description para compatibilidad hacia atrás
        const name = data.name || nameI18n?.en || nameI18n?.es || '';
        const description =
            data.description || descriptionI18n?.en || descriptionI18n?.es || '';

        const service = await this.prisma.client.service.create({
            data: {
                name,
                description,
                nameI18n: nameI18n ? JSON.parse(JSON.stringify(nameI18n)) : null,
                descriptionI18n: descriptionI18n
                    ? JSON.parse(JSON.stringify(descriptionI18n))
                    : null,
                category: data.category,
                price: data.price,
                ...(data.originalPrice !== undefined && {
                    originalPrice: data.originalPrice,
                }),
            },
        });

        return service;
    }

    async updateService(
        serviceId: string,
        data: {
            name?: string;
            description?: string;
            nameI18n?: { en?: string; es?: string };
            descriptionI18n?: { en?: string; es?: string };
            category?: string;
            price?: number;
            originalPrice?: number;
        },
    ) {
        const updateData: any = {};

        // Manejar nameI18n
        if (data.nameI18n !== undefined) {
            updateData.nameI18n = JSON.parse(JSON.stringify(data.nameI18n));
            // Actualizar name legacy con el valor en inglés o español como fallback
            updateData.name = data.nameI18n.en || data.nameI18n.es || data.name || '';
        } else if (data.name !== undefined) {
            updateData.name = data.name;
            // Si no hay nameI18n pero hay name, actualizar ambos idiomas
            if (!updateData.nameI18n) {
                updateData.nameI18n = { en: data.name, es: data.name };
            }
        }

        // Manejar descriptionI18n
        if (data.descriptionI18n !== undefined) {
            updateData.descriptionI18n = JSON.parse(
                JSON.stringify(data.descriptionI18n),
            );
            // Actualizar description legacy con el valor en inglés o español como fallback
            updateData.description =
                data.descriptionI18n.en ||
                data.descriptionI18n.es ||
                data.description ||
                '';
        } else if (data.description !== undefined) {
            updateData.description = data.description;
            // Si no hay descriptionI18n pero hay description, actualizar ambos idiomas
            if (!updateData.descriptionI18n) {
                updateData.descriptionI18n = {
                    en: data.description,
                    es: data.description,
                };
            }
        }

        // Otros campos
        if (data.category !== undefined) updateData.category = data.category;
        if (data.price !== undefined) updateData.price = data.price;
        if (data.originalPrice !== undefined)
            updateData.originalPrice = data.originalPrice;

        const service = await this.prisma.client.service.update({
            where: { id: serviceId },
            data: updateData,
        });

        return service;
    }

    async deleteService(serviceId: string) {
        // Check if service has orders
        const ordersCount = await this.prisma.order.count({
            where: { serviceId },
        });

        if (ordersCount > 0) {
            throw new Error('Cannot delete service with existing orders');
        }

        // Use transaction to ensure all deletions happen atomically
        await this.prisma.client.$transaction(
            async (tx) => {
                // 1. Delete reviews
                await (tx as any).serviceReview.deleteMany({
                    where: { serviceId },
                });

                // 2. Delete doc types - CRITICAL: must delete before service
                // Note: Schema has onDelete: Cascade, but we delete manually as backup
                try {
                    // Try using raw SQL (most reliable method)
                    await tx.$executeRawUnsafe(
                        `DELETE FROM "ServiceDoctype" WHERE "serviceId" = $1`,
                        serviceId,
                    );
                } catch (sqlError: any) {
                    // If SQL fails, try with model (if available)
                    try {
                        if ((tx as any).serviceDoctype) {
                            await (tx as any).serviceDoctype.deleteMany({
                                where: { serviceId },
                            });
                        }
                    } catch (modelError: any) {
                        // If both fail, log but continue
                        // With onDelete: Cascade in schema, Prisma should handle it when deleting service
                        console.warn(
                            'Could not manually delete ServiceDoctype, relying on Cascade:',
                            {
                                sqlError: sqlError.message,
                                modelError: modelError?.message,
                            },
                        );
                    }
                }

                // 3. Delete steps
                await (tx as any).serviceStep.deleteMany({
                    where: { serviceId },
                });

                // 4. Delete service (this will fail if ServiceDoctype still exists)
                await tx.service.delete({
                    where: { id: serviceId },
                });
            },
            {
                timeout: 10000, // 10 second timeout
            },
        );

        return { message: 'Service deleted successfully' };
    }

    // Service Steps Management
    async createServiceStep(
        serviceId: string,
        data: {
            title: string;
            description?: string;
            formConfig?: any;
            formId?: string | null;
        },
    ) {
        const lastStep = await (this.prisma.client as any).serviceStep.findFirst({
            where: { serviceId },
            orderBy: { orderIndex: 'desc' },
        });
        const orderIndex = (lastStep?.orderIndex ?? -1) + 1;

        return (this.prisma.client as any).serviceStep.create({
            data: {
                serviceId,
                title: data.title,
                description: data.description || null,
                formConfig: data.formId ? null : (data.formConfig ?? []),
                formId: data.formId || null,
                orderIndex,
            },
        });
    }

    updateServiceStep(
        stepId: string,
        data: {
            title?: string;
            description?: string;
            formConfig?: any;
            formId?: string | null;
        },
    ) {
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
            data: update,
        });
    }

    deleteServiceStep(stepId: string) {
        return (this.prisma.client as any).serviceStep.delete({
            where: { id: stepId },
        });
    }

    async reorderServiceSteps(stepIds: string[]) {
        // Transaction to update all steps
        return this.prisma.client.$transaction(
            stepIds.map((id, index) =>
                (this.prisma.client as any).serviceStep.update({
                    where: { id },
                    data: { orderIndex: index },
                }),
            ),
        );
    }

    async sendTestPush(userId: string) {
        const user = await (this.prisma.user as any).findUnique({
            where: { id: userId },
            select: { fcmToken: true, name: true, email: true },
        });

        if (!user?.fcmToken) {
            throw new Error('User does not have a registered push token');
        }

        await this.firebaseService.sendPushNotification(
            user.fcmToken,
            '🔔 Prueba de Notificación',
            '¡Hola! Esta es una notificación de prueba de TrustTax. Si recibes esto, tu dispositivo está configurado correctamente.',
            {
                type: 'admin_test',
                link: '/dashboard',
            },
        );

        return { success: true };
    }

    async deleteClient(clientId: string) {
        // Verify client exists and is a CLIENT
        const client = await (this.prisma.user as any).findUnique({
            where: { id: clientId },
            select: { id: true, role: true, email: true, fcmToken: true },
        });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        if (client.role !== 'CLIENT') {
            throw new Error('Can only delete CLIENT users');
        }

        console.log(`[AdminService] Starting cascade deletion for client ${clientId} (${client.email})`);

        try {
            // Firebase cleanup (FCM): there's nothing to delete inside Firebase itself for tokens,
            // but we MUST stop sending pushes to this user immediately.
            if (client.fcmToken) {
                try {
                    await (this.prisma.user as any).update({
                        where: { id: clientId },
                        data: { fcmToken: null },
                    });
                    console.log(`[AdminService] Cleared FCM token for user ${clientId}`);
                } catch (e: any) {
                    console.warn(
                        `[AdminService] Failed to clear FCM token for user ${clientId}: ${e?.message}`,
                    );
                }
            }

            // First, delete S3 files outside transaction (to avoid transaction rollback if S3 fails)
            const documents = await this.prisma.document.findMany({
                where: { userId: clientId },
                select: { id: true, s3Key: true },
            });

            const s3DeletionErrors: string[] = [];
            for (const doc of documents) {
                if (doc.s3Key) {
                    try {
                        await this.storageService.deleteFile(doc.s3Key);
                        console.log(`[AdminService] Deleted S3 file: ${doc.s3Key}`);
                    } catch (error: any) {
                        const errorMsg = `Failed to delete S3 file ${doc.s3Key}: ${error.message}`;
                        console.warn(`[AdminService] ${errorMsg}`);
                        s3DeletionErrors.push(errorMsg);
                        // Continue even if S3 deletion fails - we'll still delete from DB
                    }
                }
            }

            // Prisma Accelerate limits INTERACTIVE transactions (callback form) to max 15000ms.
            // Use a NON-interactive/batch transaction instead: $transaction([op1, op2, ...]).
            const prismaAny = this.prisma.client as any;

            const conversationIds: string[] = (
                await prismaAny.conversation.findMany({
                    where: { clientId },
                    select: { id: true },
                })
            ).map((c: any) => c.id);

            const orderIds: string[] = (
                await prismaAny.order.findMany({
                    where: { userId: clientId },
                    select: { id: true },
                })
            ).map((o: any) => o.id);

            const invoiceIds: string[] = (
                await prismaAny.invoice.findMany({
                    where: { clientId },
                    select: { id: true },
                })
            ).map((i: any) => i.id);

            const taxReturnIds: string[] = (
                await prismaAny.taxReturn.findMany({
                    where: { clientId },
                    select: { id: true },
                })
            ).map((tr: any) => tr.id);

            const immigrationCaseIds: string[] = (
                await prismaAny.immigrationCase.findMany({
                    where: { userId: clientId },
                    select: { id: true },
                })
            ).map((ic: any) => ic.id);

            const [
                messagesByConversation,
                messagesBySender,
                documentsDeleted,
                conversationsDeleted,
                orderTimelineDeleted,
                orderApprovalDeleted,
                orderStepProgressDeleted,
                ordersDeleted,
                paymentsDeleted,
                invoicesDeleted,
                deductionsDeleted,
                taxFormsDeleted,
                taxReturnsDeleted,
                caseTimelineDeleted,
                immigrationCasesDeleted,
                appointmentsDeleted,
                auditLogsDeleted,
                userDeleted,
            ] = await prismaAny.$transaction([
                prismaAny.message.deleteMany({
                    where: { conversationId: { in: conversationIds } },
                }),
                prismaAny.message.deleteMany({ where: { senderId: clientId } }),

                // Must be after messages due to Message.documentId FK
                prismaAny.document.deleteMany({ where: { userId: clientId } }),
                prismaAny.conversation.deleteMany({ where: { clientId } }),

                prismaAny.orderTimeline.deleteMany({ where: { orderId: { in: orderIds } } }),
                prismaAny.orderApproval.deleteMany({ where: { orderId: { in: orderIds } } }),
                prismaAny.orderStepProgress.deleteMany({ where: { orderId: { in: orderIds } } }),
                prismaAny.order.deleteMany({ where: { userId: clientId } }),

                prismaAny.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } }),
                prismaAny.invoice.deleteMany({ where: { clientId } }),

                prismaAny.deduction.deleteMany({ where: { taxReturnId: { in: taxReturnIds } } }),
                prismaAny.taxForm.deleteMany({ where: { taxReturnId: { in: taxReturnIds } } }),
                prismaAny.taxReturn.deleteMany({ where: { clientId } }),

                prismaAny.caseTimeline.deleteMany({
                    where: { immigrationCaseId: { in: immigrationCaseIds } },
                }),
                prismaAny.immigrationCase.deleteMany({ where: { userId: clientId } }),

                prismaAny.appointment.deleteMany({ where: { clientId } }),
                prismaAny.auditLog.deleteMany({ where: { userId: clientId } }),

                // Final delete (RESTRICT dependencies must be removed above)
                prismaAny.user.delete({ where: { id: clientId } }),
            ]);

            const totalMessagesCount =
                (messagesByConversation?.count ?? 0) + (messagesBySender?.count ?? 0);

            console.log(`[AdminService] Deleted ${totalMessagesCount} messages`);
            console.log(`[AdminService] Deleted ${documentsDeleted?.count ?? 0} documents`);
            console.log(`[AdminService] Deleted ${conversationsDeleted?.count ?? 0} conversations`);
            console.log(`[AdminService] Deleted ${ordersDeleted?.count ?? 0} orders`);
            console.log(`[AdminService] Deleted ${invoicesDeleted?.count ?? 0} invoices`);
            console.log(`[AdminService] Deleted ${taxReturnsDeleted?.count ?? 0} tax returns`);
            console.log(`[AdminService] Deleted ${immigrationCasesDeleted?.count ?? 0} immigration cases`);
            console.log(`[AdminService] Deleted ${appointmentsDeleted?.count ?? 0} appointments`);
            console.log(`[AdminService] Deleted ${auditLogsDeleted?.count ?? 0} audit logs`);
            console.log(`[AdminService] Deleted user ${userDeleted?.id ?? clientId}`);

            return {
                success: true,
                message: 'Client and all related data deleted successfully',
                deleted: {
                    messages: totalMessagesCount,
                    documents: documentsDeleted?.count ?? 0,
                    conversations: conversationsDeleted?.count ?? 0,
                    orders: ordersDeleted?.count ?? 0,
                    invoices: invoicesDeleted?.count ?? 0,
                    taxReturns: taxReturnsDeleted?.count ?? 0,
                    immigrationCases: immigrationCasesDeleted?.count ?? 0,
                    appointments: appointmentsDeleted?.count ?? 0,
                    auditLogs: auditLogsDeleted?.count ?? 0,
                    orderTimeline: orderTimelineDeleted?.count ?? 0,
                    orderApprovals: orderApprovalDeleted?.count ?? 0,
                    orderStepProgress: orderStepProgressDeleted?.count ?? 0,
                    payments: paymentsDeleted?.count ?? 0,
                    deductions: deductionsDeleted?.count ?? 0,
                    taxForms: taxFormsDeleted?.count ?? 0,
                    caseTimeline: caseTimelineDeleted?.count ?? 0,
                },
                warnings: s3DeletionErrors.length > 0 ? s3DeletionErrors : undefined,
                firebase: {
                    fcmTokenCleared: !!client.fcmToken,
                    note: 'Firebase is used only for FCM push in this backend; no Firestore/Auth user is stored here.',
                },
            };
        } catch (error: any) {
            console.error(`[AdminService] Error deleting client ${clientId}:`, {
                message: error.message,
                code: error.code,
                meta: error.meta,
                name: error.name,
                stack: error.stack,
            });

            // Re-throw with more context
            throw new Error(
                `Failed to delete client: ${error.message || 'Unknown error'}. ` +
                `Code: ${error.code || 'N/A'}. ` +
                `Check server logs for details.`
            );
        }
    }
}
