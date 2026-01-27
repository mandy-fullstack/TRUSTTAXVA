import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private chatGateway: ChatGateway
    ) { }

    async create(userId: string, serviceId: string, metadata: any) {
        // 1. Verify service exists
        const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException(`Service with ID ${serviceId} not found`);
        }

        // 2. Generate professional Display ID
        const now = new Date();
        const year = now.getFullYear();
        const totalOrders = await this.prisma.order.count(); // Simple sequence, could be improved with atomic counter
        const orderNumber = (totalOrders + 1).toString().padStart(4, '0');

        // Generate a 2-3 letter code from service name (e.g., "Tax Return" -> "TR")
        const words = service.name.split(' ');
        let code = service.name.substring(0, 3).toUpperCase();
        if (words.length > 1) {
            code = words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
        }

        const displayId = `TRUSTTAX-${year}-${code}-${orderNumber}`;

        // 3. Create the order
        const order = await this.prisma.order.create({
            data: {
                userId,
                serviceId,
                status: 'SUBMITTED',
                displayId,
                total: service.price,
                timeline: {
                    create: {
                        title: 'Orden recibida',
                        description: 'Estamos procesando tu solicitud profesionalmente.',
                    }
                }
            },
        });

        // 4. Create initial progress if metadata is provided
        if (metadata) {
            await this.prisma.orderStepProgress.create({
                data: {
                    orderId: order.id,
                    stepIndex: 0,
                    data: metadata,
                }
            });
        }

        return order;
    }

    async findAllByUser(userId: string) {
        return this.prisma.order.findMany({
            where: { userId },
            include: {
                service: true,
                approvals: {
                    where: { status: 'PENDING' }
                }
            },
            orderBy: {
                updatedAt: 'desc', // Sort by updated at so recent changes bubbles up? OR createdAt? 
                // Currently it was createdAt. Let's keep createdAt but maybe add updatedAt sorting logic in frontend?
                // Actually, for a list of orders, createdAt is standard.
                createdAt: 'desc',
            },
        });
    }

    async findOne(userId: string, id: string) {
        const order = await this.prisma.order.findFirst({
            where: { id, userId },
            include: {
                service: true,
                progress: {
                    orderBy: { stepIndex: 'asc' }
                },
                documents: true,
                timeline: {
                    orderBy: { createdAt: 'desc' }
                },
                approvals: {
                    orderBy: { createdAt: 'desc' }
                }
            } as any,
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async respondToApproval(userId: string, approvalId: string, status: 'APPROVED' | 'REJECTED', clientNote?: string) {
        const approval = await this.prisma.orderApproval.findUnique({
            where: { id: approvalId },
            include: { order: true }
        });

        if (!approval || approval.order.userId !== userId) {
            throw new NotFoundException('Approval request not found');
        }

        const updated = await this.prisma.orderApproval.update({
            where: { id: approvalId },
            data: {
                status,
                clientNote,
                updatedAt: new Date()
            }
        });

        // Log to timeline
        await this.prisma.orderTimeline.create({
            data: {
                orderId: approval.orderId,
                title: `Aprobación Respondida: ${status}`,
                description: `El cliente ha ${status === 'APPROVED' ? 'aprobado' : 'rechazado'} la solicitud. Nota: ${clientNote || 'Sin notas'}`
            }
        });

        // Emit real-time update
        this.chatGateway.server.to(`user_${approval.order.userId}`).emit('notification', {
            type: 'order',
            title: 'Aprobación Recibida',
            body: `El cliente ha respondido a la aprobación: ${status}`,
            link: `/orders/${approval.orderId}`
        });

        // Also emit to admin channel
        this.chatGateway.server.to('admin_notifications').emit('notification', {
            type: 'order',
            title: 'Aprobación de Orden',
            body: `Cliente respondió con ${status} para la orden ${approval.orderId.slice(0, 8)}`,
            link: `/admin/orders/${approval.orderId}`
        });

        return updated;
    }
}
