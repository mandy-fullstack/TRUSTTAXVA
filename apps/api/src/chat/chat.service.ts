import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService } from '../common/services/firebase.service';
import { RedisService } from '../common/services/redis.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
    private redisService: RedisService,
  ) {}

  async createConversation(clientId: string, subject?: string) {
    const conversation = await this.prisma.conversation.create({
      data: {
        clientId,
        subject: subject || 'New Conversation',
      },
      include: {
        messages: true,
      },
    });

    // Invalidate cache
    await this.redisService.del(`conversations:${clientId}`);
    await this.redisService.del(`conversations:admin`);

    return conversation;
  }

  async getConversations(userId: string, role: string) {
    const cacheKey =
      role === 'CLIENT' ? `conversations:${userId}` : `conversations:admin`;
    const cached = await this.redisService.get<any[]>(cacheKey);
    if (cached) return cached;

    let conversations;
    if (role === 'CLIENT') {
      conversations = await this.prisma.conversation.findMany({
        where: { clientId: userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          preparer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      // ADMIN or PREPARER
      conversations = await this.prisma.conversation.findMany({
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, conversations, 300);
    return conversations;
  }

  async getConversationById(
    id: string,
    userId: string,
    role: string,
    cursor?: string,
    limit: number = 50,
  ) {
    // Security check first
    const conversationInfo = await this.prisma.conversation.findUnique({
      where: { id },
      select: { clientId: true, preparerId: true },
    });

    if (!conversationInfo) {
      throw new NotFoundException('Conversation not found');
    }

    if (role === 'CLIENT' && conversationInfo.clientId !== userId) {
      throw new NotFoundException('Conversation not found');
    }

    // Try to get from Redis first if it's the first page
    if (!cursor) {
      const cachedMessages = await this.redisService.get<any[]>(
        `active_messages:${id}`,
      );
      if (cachedMessages) {
        // Ensure cached messages have proxy URLs (in case cache was created before fix)
        const messagesWithProxyUrls = cachedMessages.map((msg: any) => {
          if (msg.document && msg.document.id) {
            return {
              ...msg,
              document: {
                ...msg.document,
                url: `/documents/${msg.document.id}/content`,
              },
            };
          }
          return msg;
        });
        // Return conversation with cached messages
        // We still need the conversation metadata
        const metadata = await this.prisma.conversation.findUnique({
          where: { id },
          include: {
            client: { select: { id: true, name: true, email: true } },
            preparer: { select: { id: true, name: true, email: true } },
          },
        });
        return { ...metadata, messages: messagesWithProxyUrls };
      }
    }

    const messages = await this.prisma.message.findMany({
      where: { conversationId: id },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' }, // Latest first for pagination efficiency
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        document: true,
      },
    });

    // Transform document URLs to use backend proxy instead of direct Firebase Storage URLs
    const messagesWithProxyUrls = messages.map((msg: any) => {
      if (msg.document && msg.document.id) {
        return {
          ...msg,
          document: {
            ...msg.document,
            url: `/documents/${msg.document.id}/content`, // Use backend proxy URL
          },
        };
      }
      return msg;
    });

    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        preparer: { select: { id: true, name: true, email: true } },
      },
    });

    const result = { ...conversation, messages: messagesWithProxyUrls.reverse() }; // Reverse to keep chronological order in UI

    // Cache the first page if it's new (with proxy URLs)
    if (!cursor && messagesWithProxyUrls.length > 0) {
      await this.redisService.set(
        `active_messages:${id}`,
        result.messages,
        600,
      ); // 10 mins cache
    }

    return result;
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    documentId?: string,
  ) {
    // Verify conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // If there is a document, link it to the conversation as well
    if (documentId) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { conversationId },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        documentId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        conversation: {
          select: {
            clientId: true,
            preparerId: true,
          },
        },
        document: true,
      },
    });

    // Transform document URL to use backend proxy
    const messageWithProxyUrl = message.document
      ? {
          ...message,
          document: {
            ...message.document,
            url: `/documents/${message.document.id}/content`,
          },
        }
      : message;

    // Update conversation timestamp
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Invalidate caches
    await this.redisService.del(`conversations:${conversation.clientId}`);
    await this.redisService.del(`conversations:admin`);
    await this.redisService.del(`unread_count:${conversation.clientId}`);
    if (conversation.preparerId) {
      await this.redisService.del(`unread_count:${conversation.preparerId}`);
    }

    // Invalidate message cache
    await this.redisService.del(`active_messages:${conversationId}`);

    // Trigger Push Notification
    this.triggerPushNotification(message);

    return messageWithProxyUrl;
  }

  private async triggerPushNotification(message: any) {
    try {
      const { conversationId, senderId, sender, content } = message;
      const conversation = await (this.prisma.conversation as any).findUnique({
        where: { id: conversationId },
        include: {
          client: { select: { id: true, fcmToken: true } },
          preparer: { select: { id: true, fcmToken: true } },
        },
      });

      if (!conversation) return;

      // Determine recipient
      const recipient =
        conversation.clientId === senderId
          ? conversation.preparer
          : conversation.client;

      if (recipient && recipient.fcmToken) {
        const isToClient = conversation.clientId === recipient.id;
        const link = isToClient
          ? `/dashboard/chat/${conversationId}`
          : `/chat/${conversationId}`;

        await this.firebaseService.sendPushNotification(
          recipient.fcmToken,
          `💬 ${sender.name || 'Soporte'}`,
          content.length > 100 ? content.substring(0, 97) + '...' : content,
          {
            type: 'chat',
            conversationId,
            link,
          },
        );
      }
    } catch (error) {
      console.error('Failed to send message push notification:', error);
    }
  }

  async deleteConversation(id: string, userId: string, role: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Only allow deletion if user is the client who owns it, or an ADMIN
    if (role === 'CLIENT' && conversation.clientId !== userId) {
      throw new NotFoundException('Conversation not found'); // Hide existence
    }

    return this.prisma.conversation.delete({
      where: { id },
    });
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    // Mark all messages in this conversation where the sender IS NOT the current user as read
    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        isDelivered: true, // If read, it's definitely delivered
      },
    });

    // Invalidate cache
    await this.redisService.del(`unread_count:${userId}`);

    return result;
  }

  async markMessagesAsDelivered(conversationId: string, userId: string) {
    // Mark all messages in this conversation where the sender IS NOT the current user as delivered
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isDelivered: false,
      },
      data: {
        isDelivered: true,
      },
    });
  }

  async getUnreadMessageCount(userId: string) {
    const cacheKey = `unread_count:${userId}`;
    const cached = await this.redisService.get<{ count: number }>(cacheKey);
    if (cached) return cached;

    const count = await this.prisma.message.count({
      where: {
        senderId: { not: userId },
        isRead: false,
        conversation: {
          OR: [{ clientId: userId }, { preparerId: userId }],
        },
      },
    });

    const result = { count };
    await this.redisService.set(cacheKey, result, 300);
    return result;
  }
}
