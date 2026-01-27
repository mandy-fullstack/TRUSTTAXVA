import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async createConversation(clientId: string, subject?: string) {
        return this.prisma.conversation.create({
            data: {
                clientId,
                subject: subject || 'New Conversation',
            },
            include: {
                messages: true
            }
        });
    }

    async getConversations(userId: string, role: string) {
        if (role === 'CLIENT') {
            return this.prisma.conversation.findMany({
                where: { clientId: userId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    preparer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } else {
            // ADMIN or PREPARER
            return this.prisma.conversation.findMany({
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        }
    }

    async getConversationById(id: string, userId: string, role: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                preparer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Security check
        if (role === 'CLIENT' && conversation.clientId !== userId) {
            throw new NotFoundException('Conversation not found');
        }

        return conversation;
    }

    async sendMessage(conversationId: string, senderId: string, content: string) {
        // Verify conversation exists
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                conversation: {
                    select: {
                        clientId: true,
                        preparerId: true
                    }
                }
            }
        });

        // Update conversation timestamp
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        return message;
    }

    async deleteConversation(id: string, userId: string, role: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id }
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Only allow deletion if user is the client who owns it, or an ADMIN
        if (role === 'CLIENT' && conversation.clientId !== userId) {
            throw new NotFoundException('Conversation not found'); // Hide existence
        }

        return this.prisma.conversation.delete({
            where: { id }
        });
    }

    async markMessagesAsRead(conversationId: string, userId: string) {
        // Mark all messages in this conversation where the sender IS NOT the current user as read
        return this.prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true
            }
        });
    }
}
