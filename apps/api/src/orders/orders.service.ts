import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { ChatGateway } from '../chat/chat.gateway';
import { FirebaseService } from '../common/services/firebase.service';
import { EncryptionService } from '../common/services/encryption.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private chatGateway: ChatGateway,
        private firebaseService: FirebaseService,
        private encryptionService: EncryptionService,
    ) { }

    async create(
        userId: string,
        serviceId: string,
        metadata: any,
        status: string = 'SUBMITTED',
    ) {
        // 1. Verify service exists
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException(`Service with ID ${serviceId} not found`);
        }

        if (status === 'DRAFT') {
            const existingDraft = await this.prisma.order.findFirst({
                where: { userId, serviceId, status: 'DRAFT' },
                include: { progress: true },
            });

            if (existingDraft) {
                console.log(
                    `[OrdersService] Found existing draft ${existingDraft.id} for user ${userId}, reusing.`,
                );

                // If metadata is provided, we should update the existing draft's progress
                if (metadata) {
                    // Preserve existing docData if updating
                    const existingProgress =
                        await this.prisma.orderStepProgress.findFirst({
                            where: { orderId: existingDraft.id, stepIndex: 0 },
                        });
                    const existingDocData = existingProgress?.data?.docData || {};
                    const mergedDocData = metadata.docData
                        ? { ...existingDocData, ...metadata.docData }
                        : existingDocData;

                    const encryptedMetadata = {
                        ...metadata,
                        formData: metadata.formData
                            ? this.encryptionService.encryptSensitiveFields(metadata.formData)
                            : existingProgress?.data?.formData || {},
                        docData: mergedDocData,
                    };

                    if (existingProgress) {
                        await this.prisma.orderStepProgress.update({
                            where: { id: existingProgress.id },
                            data: {
                                data: encryptedMetadata,
                                completedAt: new Date(),
                            },
                        });
                    } else {
                        await this.prisma.orderStepProgress.create({
                            data: {
                                orderId: existingDraft.id,
                                stepIndex: 0,
                                data: encryptedMetadata,
                            },
                        });
                    }
                }
                return existingDraft;
            }
        }

        // 4. Generate professional Display ID
        const now = new Date();
        const year = now.getFullYear();
        const totalOrders = await this.prisma.order.count(); // Simple sequence, could be improved with atomic counter
        const orderNumber = (totalOrders + 1).toString().padStart(4, '0');

        // Generate a 2-3 letter code from service name (e.g., "Tax Return" -> "TR")
        const words = service.name.split(' ');
        let code = service.name.substring(0, 3).toUpperCase();
        if (words.length > 1) {
            code = words
                .map((w) => w[0])
                .join('')
                .substring(0, 3)
                .toUpperCase();
        }

        const displayId = `TRUSTTAX-${year}-${code}-${orderNumber}`;

        // 5. Create the order
        const order = await this.prisma.order.create({
            data: {
                userId,
                serviceId,
                status, // Use provided status (DRAFT or SUBMITTED)
                displayId,
                total: service.price,
                timeline: {
                    create: {
                        title: status === 'DRAFT' ? 'Borrador Iniciado' : 'Orden recibida',
                        description:
                            status === 'DRAFT'
                                ? 'Has iniciado una solicitud. Puedes continuar en cualquier momento.'
                                : 'Estamos procesando tu solicitud profesionalmente.',
                    },
                },
            },
        });

        // 4. Create initial progress if metadata is provided
        if (metadata) {
            const encryptedMetadata = {
                ...metadata,
                formData: metadata.formData
                    ? this.encryptionService.encryptSensitiveFields(metadata.formData)
                    : {},
                // docData se preserva tal cual (solo contiene IDs y nombres de archivo, no datos sensibles)
                docData: metadata.docData || {},
            };

            await this.prisma.orderStepProgress.create({
                data: {
                    orderId: order.id,
                    stepIndex: 0,
                    data: encryptedMetadata,
                },
            });

            // 5. Link documents to order automatically
            // If the metadata contains formData with w2Uploads, link those documents
            const w2Uploads = metadata.formData?.w2Uploads;
            if (Array.isArray(w2Uploads)) {
                for (const upload of w2Uploads) {
                    if (upload.id) {
                        await this.prisma.document
                            .updateMany({
                                where: { id: upload.id, userId, orderId: null },
                                data: { orderId: order.id },
                            })
                            .catch((err: any) =>
                                console.warn(
                                    `Failed to link document ${upload.id} to order ${order.id}`,
                                    err,
                                ),
                            );
                    }
                }
            }

            // 6. Link Missing Docs
            const docData =
                metadata.docData ||
                metadata.formData?.docMappings ||
                metadata.formData?.docData;
            if (docData && typeof docData === 'object') {
                for (const doc of Object.values(docData) as any) {
                    if (doc?.id) {
                        await this.prisma.document
                            .updateMany({
                                where: { id: doc.id, userId, orderId: null },
                                data: { orderId: order.id },
                            })
                            .catch((e: any) =>
                                console.warn(
                                    `[OrdersService.create] Failed to link doc ${doc.id}`,
                                    e,
                                ),
                            );
                    }
                }
            }
        }

        return order;
    }

    async update(
        userId: string,
        orderId: string,
        data: { status?: string; formData?: any; docData?: any },
    ) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Update status if provided
        if (data.status) {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { status: data.status },
            });

            // Log status change if finishing draft
            if (order.status === 'DRAFT' && data.status === 'SUBMITTED') {
                await this.prisma.orderTimeline.create({
                    data: {
                        orderId,
                        title: 'Orden Enviada',
                        description: 'Has completado y enviado tu solicitud exitosamente.',
                    },
                });
            }
        }

        // Update progress/data if provided
        if (data.formData || data.docData) {
            // Optimization: Update existing progress record for stepIndex 0 instead of creating new ones
            // This prevents database bloat from autosaves and simplifies the admin view.
            const existingProgress = await this.prisma.orderStepProgress.findFirst({
                where: { orderId, stepIndex: 0 },
            });

            // Preserve existing docData if new one is not provided
            const existingDocData = existingProgress?.data?.docData || {};
            const mergedDocData = data.docData
                ? { ...existingDocData, ...data.docData } // Merge: new data overrides existing
                : existingDocData; // Keep existing if no new data

            const nextMetadata = {
                formData: data.formData
                    ? this.encryptionService.encryptSensitiveFields(data.formData)
                    : existingProgress?.data?.formData || {},
                docData: mergedDocData,
            };

            if (existingProgress) {
                // Merge with existing if needed, or just overwrite latest summary
                await this.prisma.orderStepProgress.update({
                    where: { id: existingProgress.id },
                    data: {
                        data: nextMetadata,
                        completedAt: new Date(),
                    },
                });
            } else {
                await this.prisma.orderStepProgress.create({
                    data: {
                        orderId,
                        stepIndex: 0,
                        data: nextMetadata,
                    },
                });
            }

            // --- Automatic Document Linking ---
            // 1. Link W-2s
            const w2Uploads = data.formData?.w2Uploads;
            if (Array.isArray(w2Uploads)) {
                for (const upload of w2Uploads) {
                    if (upload.id) {
                        await this.prisma.document
                            .updateMany({
                                where: { id: upload.id, userId, orderId: null },
                                data: { orderId },
                            })
                            .catch((e: any) =>
                                console.warn(
                                    `[OrdersService] Failed to link W2 ${upload.id}`,
                                    e,
                                ),
                            );
                    }
                }
            }

            // 2. Link Missing Docs (from docMappings or similar)
            const docData =
                data.docData || data.formData?.docMappings || data.formData?.docData;
            if (docData && typeof docData === 'object') {
                for (const doc of Object.values(docData) as any) {
                    if (doc?.id) {
                        await this.prisma.document
                            .updateMany({
                                where: { id: doc.id, userId, orderId: null },
                                data: { orderId },
                            })
                            .catch((e: any) =>
                                console.warn(
                                    `[OrdersService] Failed to link missing doc ${doc.id}`,
                                    e,
                                ),
                            );
                    }
                }
            }
        }

        return { success: true };
    }

    async delete(userId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        if (order.status !== 'DRAFT') {
            throw new NotFoundException('Only draft orders can be deleted');
        }

        // Delete order and related data (cascade should handle related, but verify)
        // Prisma cascade delete should handle progress and timeline if configured
        // Otherwise we manually delete related
        await this.prisma.orderStepProgress.deleteMany({ where: { orderId: id } });
        await this.prisma.orderTimeline.deleteMany({ where: { orderId: id } });
        await this.prisma.orderApproval.deleteMany({ where: { orderId: id } });

        // Unlink documents instead of deleting them, so user can reuse them
        await this.prisma.document.updateMany({
            where: { orderId: id },
            data: { orderId: null },
        });

        return this.prisma.order.delete({
            where: { id },
        });
    }

    async findAllByUser(userId: string) {
        try {
            return await this.prisma.order.findMany({
                where: { userId },
                include: {
                    service: true,
                    approvals: {
                        where: { status: 'PENDING' },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            console.error(
                '[OrdersService] Error fetching orders for user ' + userId,
                error,
            );
            throw new InternalServerErrorException(
                `Failed to fetch orders: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    async findOne(userId: string, id: string, decryptForReview: boolean = false) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: {
                service: true,
                progress: {
                    orderBy: { completedAt: 'asc' },
                },
                documents: true,
                timeline: {
                    orderBy: { createdAt: 'desc' },
                },
                approvals: {
                    orderBy: { createdAt: 'desc' },
                },
            } as any,
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        // If decryptForReview is true, decrypt formData for editing/review in the wizard
        // This ensures all form fields are displayed in readable format throughout the wizard
        if (decryptForReview && order.progress && order.progress.length > 0) {
            // Filter only OrderStepProgress items (they have 'data' property)
            const progressItems = (order.progress as any[]).filter(
                (p: any) => p.data !== undefined,
            );
            if (progressItems.length > 0) {
                const latestProgress = progressItems[progressItems.length - 1] as any;
                if (latestProgress.data?.formData) {
                    // Decrypt sensitive fields for form editing and review
                    // This allows users to see and edit their data in all wizard steps
                    const decryptedFormData =
                        this.encryptionService.decryptSensitiveFields(
                            latestProgress.data.formData,
                        );
                    // Update the progress data with decrypted formData
                    latestProgress.data = {
                        ...latestProgress.data,
                        formData: decryptedFormData,
                    };
                }
            }
        }

        return order;
    }

    async respondToApproval(
        userId: string,
        approvalId: string,
        status: 'APPROVED' | 'REJECTED',
        clientNote?: string,
    ) {
        const approval = await this.prisma.orderApproval.findUnique({
            where: { id: approvalId },
            include: { order: true },
        });

        if (!approval || approval.order.userId !== userId) {
            throw new NotFoundException('Approval request not found');
        }

        const updated = await this.prisma.orderApproval.update({
            where: { id: approvalId },
            data: {
                status,
                clientNote,
                updatedAt: new Date(),
            },
        });

        // Log to timeline
        await this.prisma.orderTimeline.create({
            data: {
                orderId: approval.orderId,
                title: `Aprobación Respondida: ${status}`,
                description: `El cliente ha ${status === 'APPROVED' ? 'aprobado' : 'rechazado'} la solicitud. Nota: ${clientNote || 'Sin notas'}`,
            },
        });

        // Emit real-time update
        this.chatGateway.server
            .to(`user_${approval.order.userId}`)
            .emit('notification', {
                type: 'order',
                title: 'Aprobación Recibida',
                body: `El cliente ha respondido a la aprobación: ${status}`,
                link: `/orders/${approval.orderId}`,
            });

        this.chatGateway.server.to('admin_notifications').emit('notification', {
            type: 'order',
            title: 'Aprobación de Orden',
            body: `Cliente respondió con ${status} para la orden ${approval.orderId.slice(0, 8)}`,
            link: `/admin/orders/${approval.orderId}`,
        });

        // Trigger Push Notification for Admins (if any have registered tokens)
        this.triggerAdminPushNotification(
            `Aprobación de Orden`,
            `Cliente respondió con ${status} para la orden ${approval.orderId.slice(0, 8)}`,
            `/admin/orders/${approval.orderId}`,
        );

        return updated;
    }

    /**
     * Client: Completar una solicitud de documento (OrderApproval.type=DOCUMENT_REQUEST)
     * subiendo un documento cifrado y ligándolo a la orden.
     *
     * - Setea status=COMPLETED
     * - Guarda documentId en clientNote (JSON)
     */
    async completeDocumentRequest(
        userId: string,
        approvalId: string,
        documentId: string,
    ) {
        const approval = await this.prisma.orderApproval.findUnique({
            where: { id: approvalId },
            include: { order: true },
        });

        if (!approval || approval.order.userId !== userId) {
            throw new NotFoundException('Document request not found');
        }

        if (approval.type !== 'DOCUMENT_REQUEST') {
            throw new NotFoundException('Document request not found');
        }

        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId },
            select: { id: true, orderId: true, title: true },
        });

        if (!doc) {
            throw new NotFoundException('Document not found');
        }

        // Ensure the document is linked to this order
        if (doc.orderId !== approval.orderId) {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { orderId: approval.orderId },
            });
        }

        const updated = await this.prisma.orderApproval.update({
            where: { id: approvalId },
            data: {
                status: 'COMPLETED',
                clientNote: JSON.stringify({ documentId }),
                updatedAt: new Date(),
            },
        });

        await this.prisma.orderTimeline.create({
            data: {
                orderId: approval.orderId,
                title: 'Documento enviado',
                description: `El cliente subió un documento para la solicitud: ${approval.title}.`,
            },
        });

        // Notify admins
        this.chatGateway.server.to('admin_notifications').emit('notification', {
            type: 'order',
            title: 'Documento recibido',
            body: `Documento solicitado recibido para la orden ${approval.orderId.slice(0, 8)}`,
            link: `/admin/orders/${approval.orderId}`,
        });

        // Trigger Push Notification for Admins
        this.triggerAdminPushNotification(
            'Documento recibido',
            `Documento solicitado recibido para la orden ${approval.orderId.slice(0, 8)}`,
            `/admin/orders/${approval.orderId}`,
        );

        return updated;
    }

    private async triggerAdminPushNotification(
        title: string,
        body: string,
        link: string,
    ) {
        try {
            // Find all admins/preparers with FCM tokens
            const admins = await (this.prisma.user as any).findMany({
                where: {
                    role: { in: ['ADMIN', 'PREPARER'] },
                    fcmToken: { not: null },
                },
                select: { fcmToken: true },
            });

            for (const admin of admins as any[]) {
                if (admin.fcmToken) {
                    await this.firebaseService.sendPushNotification(
                        admin.fcmToken,
                        title,
                        body,
                        {
                            type: 'admin_notification',
                            link,
                        },
                    );
                }
            }
        } catch (error) {
            console.error('Failed to send admin push notification:', error);
        }
    }
}
