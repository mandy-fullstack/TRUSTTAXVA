/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { StorageService } from '../common/services/storage.service';
import { ChatGateway } from '../chat/chat.gateway';
import { FirebaseService } from '../common/services/firebase.service';
import { EmailService } from '../email/email.service';
import { DocType } from '@trusttax/database';
import type { CreateClientInvitationDto } from './dto/create-client-invitation.dto';
import { OrdersService } from '../orders/orders.service';
import { AuditService } from '../common/services/audit.service';
import { TokenService } from '../auth/token.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private encryptionService: EncryptionService,
        private storageService: StorageService,
        private chatGateway: ChatGateway,
        private firebaseService: FirebaseService,
        private emailService: EmailService,
        private ordersService: OrdersService,
        private auditService: AuditService,
        private tokenService: TokenService,
    ) { }

    async getAllClients() {
        const clients = await (this.prisma.user as any).findMany({
            where: { role: 'CLIENT' },
            select: {
                id: true,
                email: true,
                password: true,
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
        // Avoid returning password, but provide invitation status
        return (clients || []).map((c: any) => {
            const password = String(c.password || '');
            const invitationPending = !password || password.length < 10;
            const { password: _pw, ...rest } = c;
            return { ...rest, invitationPending };
        });
    }

    /**
     * Admin: Create or re-invite a CLIENT user and send an email invitation
     * to set a password (uses the same reset-password setup flow).
     */
    async createClientInvitation(payload: CreateClientInvitationDto, adminUserId?: string) {
        const email = (payload.email || '').trim().toLowerCase();
        if (!email) throw new BadRequestException('Email is required');

        const existing = await (this.prisma.user as any).findUnique({
            where: { email },
        });

        // Generate setup expiry (7 days)
        const setupExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const firstName = payload.firstName?.trim();
        const lastName = payload.lastName?.trim();

        if (existing) {
            // Only allow inviting CLIENT accounts via this endpoint
            if (existing.role && existing.role !== 'CLIENT') {
                throw new BadRequestException(
                    `A user with role ${existing.role} already exists with this email`,
                );
            }

            // Generate secure token for EXISTING user
            const setupToken = this.tokenService.createUrlToken({
                sub: existing.id,
                type: 'password_reset',
            });

            const name =
                [firstName, lastName].filter(Boolean).join(' ') ||
                (existing?.name as string) ||
                'Client';

            await (this.prisma.user as any).update({
                where: { id: existing.id },
                data: {
                    firstName: firstName || existing.firstName || undefined,
                    lastName: lastName || existing.lastName || undefined,
                    name: name || existing.name || undefined,
                    phone: payload.phone?.trim() || existing.phone || undefined,
                    passwordResetToken: setupToken,
                    passwordResetExpires: setupExpires,
                    emailVerified: true,
                    emailVerifiedAt: existing.emailVerifiedAt || new Date(),
                },
            });

            let emailSent = false;
            try {
                await this.emailService.sendClientInvitationEmail(email, setupToken, {
                    name,
                });
                emailSent = true;
            } catch (error) {
                console.error('[AdminService] Client re-invitation email failed:', error);
            }

            // Log the re-invitation
            if (adminUserId) {
                await this.auditService.log({
                    userId: adminUserId,
                    action: 'REINVITE_CLIENT',
                    entity: 'User',
                    entityId: existing.id,
                    details: {
                        email,
                        name,
                        emailSent,
                        method: 'POST /admin/clients'
                    },
                });
            }

            return {
                message: emailSent
                    ? 'Client re-invitation has been sent successfully'
                    : 'Client re-invited, but invitation email failed to send. Please check email configuration.',
                email,
                userId: existing.id,
                isReinvite: true,
                emailSent,
            };
        }

        const name = [firstName, lastName].filter(Boolean).join(' ') || 'Client';

        // Create new client first (without token) to get ID
        let user = await (this.prisma.user as any).create({
            data: {
                email,
                role: 'CLIENT',
                password: '',
                name,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: payload.phone?.trim() || undefined,
                emailVerified: true,
                emailVerifiedAt: new Date(),
            },
        });

        // Generate secure token using NEW user ID
        const setupToken = this.tokenService.createUrlToken({
            sub: user.id,
            type: 'password_reset',
        });

        // Update user with token
        user = await (this.prisma.user as any).update({
            where: { id: user.id },
            data: {
                passwordResetToken: setupToken,
                passwordResetExpires: setupExpires,
            },
        });

        let emailSent = false;
        try {
            await this.emailService.sendClientInvitationEmail(email, setupToken, {
                name,
            });
            emailSent = true;
        } catch (error) {
            console.error('[AdminService] Client invitation email failed:', error);
        }

        // Log the new invitation
        if (adminUserId) {
            await this.auditService.log({
                userId: adminUserId,
                action: 'INVITE_NEW_CLIENT',
                entity: 'User',
                entityId: user.id,
                details: {
                    email,
                    name,
                    phone: payload.phone,
                    emailSent,
                    method: 'POST /admin/clients'
                },
            });
        }

        return {
            message: emailSent
                ? 'Client invitation has been sent successfully'
                : 'Client created, but invitation email failed to send. Please check email configuration.',
            email,
            userId: user.id,
            isReinvite: false,
            emailSent,
        };
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
                auditLogs: {
                    orderBy: { createdAt: 'desc' as const },
                    take: 50,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                }
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

    async updateDocumentStatus(docId: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED') {
        const doc = await this.prisma.document.update({
            where: { id: docId },
            data: { status: status as any },
        });

        // Add timeline entry if it's related to an order
        if (doc.orderId) {
            await this.prisma.orderTimeline.create({
                data: {
                    orderId: doc.orderId,
                    title: `Documento ${status === 'VERIFIED' ? 'verificado' : status === 'REJECTED' ? 'rechazado' : 'marcado como pendiente'}`,
                    description: `El documento "${doc.title}" ha sido ${status === 'VERIFIED' ? 'aprobado' : status === 'REJECTED' ? 'rechazado' : 'cambiado a pendiente'} por el administrador.`,
                },
            });
        }

        return doc;
    }

    async getOrCreatePortalLink(orderId: string, approvalId: string) {
        // Find existing valid token
        let token = await this.prisma.portalAccessToken.findFirst({
            where: {
                orderId,
                approvalId,
                expiresAt: { gt: new Date() },
                usedAt: null,
            },
        });

        let rawToken: string;
        if (!token) {
            // Create new one if none exists or expired
            const order = await this.prisma.order.findUnique({ where: { id: orderId } });
            if (!order) throw new Error('Order not found');

            rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            token = await this.prisma.portalAccessToken.create({
                data: {
                    tokenHash,
                    purpose: 'DOCUMENT_REQUEST',
                    userId: order.userId,
                    orderId,
                    approvalId,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });
        } else {
            // We can't recover the raw token from the hash.
            // So if we need to show it again, we MUST generate a new one
            // unless we store it (which we don't for security).
            // Actually, for "Copy Link", it's better to just generate a new one every time or store it temporarily.
            // Let's just generate a new one to be sure.
            rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto
                .createHash('sha256')
                .update(rawToken)
                .digest('hex');

            await this.prisma.portalAccessToken.update({
                where: { id: token.id },
                data: {
                    tokenHash,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const portalUrl = `${baseUrl}/portal/document-request/${rawToken!}`;

        return { portalUrl };
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

    async createOrder(data: { userId: string; serviceId: string; metadata?: any; status?: string }) {
        return this.ordersService.create(
            data.userId,
            data.serviceId,
            data.metadata || {},
            data.status || 'SUBMITTED',
        );
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
        payload: {
            documentName?: string;
            message?: string;
            docType?: DocType;
            requireLogin?: boolean;
            requests?: { documentName: string; message?: string; docType?: DocType }[];
        },
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

        // Normalize requests into an array
        const requestItems = payload.requests && payload.requests.length > 0
            ? payload.requests
            : payload.documentName
                ? [{
                    documentName: payload.documentName,
                    message: payload.message,
                    docType: payload.docType,
                }]
                : [];

        if (requestItems.length === 0) {
            throw new BadRequestException('No documents requested');
        }

        const createdApprovals = [];

        // 1. Create all approvals and timelines
        for (const item of requestItems) {
            const docType = item.docType ?? DocType.OTHER;
            const description = JSON.stringify({
                message: item.message || '',
                docType,
            });

            const approval = await this.prisma.orderApproval.create({
                data: {
                    orderId,
                    type: 'DOCUMENT_REQUEST',
                    title: item.documentName,
                    description,
                },
            });
            createdApprovals.push(approval);

            await this.prisma.orderTimeline.create({
                data: {
                    orderId,
                    title: `Documento solicitado: ${item.documentName}`,
                    description: item.message || `Se solicitó el documento: ${item.documentName}`,
                },
            });

            // Socket notification (per item, or we could just do one generic one)
            this.chatGateway.server.to(`user_${order.userId}`).emit('notification', {
                type: 'order',
                subtype: 'DOCUMENT_REQUEST',
                orderId,
                approvalId: approval.id,
                documentName: item.documentName,
                docType: String(docType),
                title: 'Documento requerido',
                body: `Por favor sube: ${item.documentName}`,
                link: `/dashboard/orders/${orderId}`,
            });
        }

        await this.prisma.order.update({
            where: { id: orderId },
            data: { updatedAt: new Date() },
        });

        // 2. Send Notifications (Push & Email) - Consolidated
        const isBulk = requestItems.length > 1;
        const mainItem = requestItems[0];
        const pushTitle = isBulk ? 'Documentos requeridos' : 'Documento requerido';
        const pushBody = isBulk
            ? `Se han solicitado ${requestItems.length} documentos. Revisa tu orden.`
            : `Por favor sube: ${mainItem.documentName}`;

        void this.triggerOrderPushNotification(
            order.userId,
            pushTitle,
            pushBody,
            `/orders/${orderId}`,
        );

        // Email (Consolidated)
        try {
            const userEmail = order.user.email;
            const userName =
                order.user.firstName ||
                order.user.name ||
                userEmail.split('@')[0] ||
                'there';

            const orderDisplayId = order.displayId || order.id.slice(0, 8);

            if (payload.requireLogin) {
                // Dashboard Login Flow
                if (isBulk) {
                    await this.emailService.sendOrderDocumentRequestEmailBulk(userEmail, {
                        userName,
                        orderId,
                        orderDisplayId,
                        items: requestItems.map(r => ({
                            name: r.documentName,
                            message: r.message,
                            docType: String(r.docType || 'OTHER'),
                        })),
                    });
                } else {
                    await this.emailService.sendOrderDocumentRequestEmail(userEmail, {
                        userName,
                        orderId,
                        orderDisplayId,
                        documentName: mainItem.documentName,
                        message: mainItem.message || '',
                        docType: String(mainItem.docType || 'OTHER'),
                    });
                }
            } else {
                // Portal Flow (No Login)
                // Generate ONE portal token that links to the first approval (or a general list view if we supported it)
                // Currently portal tokens are tied to a specific approvalId.
                // For bulk, we'll just link to the FIRST one, and the frontend portal should ideally show all pending for that order,
                // OR we generate separate tokens but that defeats the "single link" purpose.
                // Strategy: Link refers to Approval #1. The portal UI *should* allow navigating back to order or seeing other pending docs.
                // If the portal is strict 1:1, we might need a "Master Token" or just link the first one.
                // Let's assume linking the first one is sufficient entry point.

                const firstApproval = createdApprovals[0];
                const rawToken = crypto.randomBytes(32).toString('hex');
                const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
                const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

                await (this.prisma as any).portalAccessToken.create({
                    data: {
                        tokenHash,
                        purpose: 'DOCUMENT_REQUEST',
                        userId: order.userId,
                        orderId,
                        approvalId: firstApproval.id, // Entry point
                        expiresAt,
                    },
                });

                const baseUrl = process.env.CLIENT_URL || process.env.ADMIN_URL || 'http://localhost:5175';
                const portalUrl = `${baseUrl}/portal/document-request/${rawToken}`;

                if (isBulk) {
                    await this.emailService.sendOrderDocumentRequestPortalEmailBulk(userEmail, {
                        userName,
                        orderId,
                        orderDisplayId,
                        items: requestItems.map(r => ({
                            name: r.documentName,
                            message: r.message,
                            docType: String(r.docType || 'OTHER'),
                        })),
                        portalUrl,
                    });
                } else {
                    await this.emailService.sendOrderDocumentRequestPortalEmail(userEmail, {
                        userName,
                        orderId,
                        orderDisplayId,
                        documentName: mainItem.documentName,
                        message: mainItem.message || '',
                        docType: String(mainItem.docType || 'OTHER'),
                        portalUrl,
                    });
                }
            }
        } catch (e: any) {
            console.warn('[AdminService] Failed to send document request email:', e?.message || e);
        }

        return createdApprovals;
    }

    async resendDocumentRequest(orderId: string, approvalId: string) {
        const approval = await this.prisma.orderApproval.findUnique({
            where: { id: approvalId },
            include: { order: { include: { user: true } } },
        });

        if (!approval || approval.orderId !== orderId) {
            throw new NotFoundException('Approval not found');
        }

        const payload = approval.description ? JSON.parse(approval.description) : {};
        const documentName = approval.title;
        const message = payload.message || '';
        const docType = payload.docType || DocType.OTHER;

        // Generate or retrieve portal link
        const { portalUrl } = await this.getOrCreatePortalLink(orderId, approvalId);

        // Send Email
        const userEmail = approval.order.user.email;
        const userName = approval.order.user.name || 'Client';
        const orderDisplayId = approval.order.displayId || approval.order.id.slice(0, 8);

        await this.emailService.sendOrderDocumentRequestPortalEmail(userEmail, {
            userName,
            orderId,
            orderDisplayId,
            documentName,
            message,
            docType: String(docType),
            portalUrl,
        });

        return { success: true, message: 'Request resent' };
    }

    async cancelDocumentRequest(orderId: string, approvalId: string) {
        // 1. Update Approval Status
        await this.prisma.orderApproval.update({
            where: { id: approvalId },
            data: { status: 'CANCELLED' },
        });

        // 2. Invalidate Token
        await (this.prisma as any).portalAccessToken.updateMany({
            where: { approvalId },
            data: { expiresAt: new Date() }, // Expire immediately
        });

        // 3. Add Timeline
        await this.prisma.orderTimeline.create({
            data: {
                orderId,
                title: 'Solicitud de documento cancelada',
                description: `El administrador canceló la solicitud: ${approvalId}`,
            },
        });

        return { success: true };
    }

    async rejectAndReRequestDocument(orderId: string, approvalId: string, reason: string) {
        // 1. Mark old approval as REJECTED
        const oldApproval = await this.prisma.orderApproval.update({
            where: { id: approvalId },
            data: {
                status: 'REJECTED',
                clientNote: reason ? `Razón de rechazo: ${reason}` : undefined
            },
        });

        // 2. Create NEW Approval (Clone)
        const payload = oldApproval.description ? JSON.parse(oldApproval.description) : {};
        const newDescription = JSON.stringify({
            ...payload,
            message: reason ? `Re-solicitado: ${reason}` : payload.message
        });

        const newApproval = await this.prisma.orderApproval.create({
            data: {
                orderId,
                type: 'DOCUMENT_REQUEST',
                title: oldApproval.title, // Keep same title
                description: newDescription,
                status: 'PENDING',
            },
        });

        // 3. Generate Link & Notify for NEW approval
        const { portalUrl } = await this.getOrCreatePortalLink(orderId, newApproval.id);

        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (order) {
            const orderDisplayId = order.displayId || order.id.slice(0, 8);
            await this.emailService.sendOrderDocumentRequestPortalEmail(order.user.email, {
                userName: order.user.name || 'Client',
                orderId,
                orderDisplayId,
                documentName: newApproval.title,
                message: reason || 'Por favor suba el documento nuevamente.',
                docType: String(payload.docType || 'OTHER'),
                portalUrl,
            });
        }

        return newApproval;
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
