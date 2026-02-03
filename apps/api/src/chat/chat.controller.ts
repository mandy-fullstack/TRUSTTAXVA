import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CompanyService } from '../company/company.service';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
    private readonly companyService: CompanyService,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.chatService.getConversations(req.user.userId, req.user.role);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.chatService.getUnreadMessageCount(req.user.userId);
  }

  @Post('mark-all-read')
  async markAllRead(@Request() req: any) {
    await this.chatService.markAllMessagesAsRead(req.user.userId);
    // Note: We don't emit 'messagesRead' here because it requires a conversationId
    // The frontend will update the unread count when it fetches conversations
    return { success: true };
  }

  @Post('conversations')
  async createConversation(
    @Request() req: any,
    @Body() body: { subject?: string },
  ) {
    return this.chatService.createConversation(req.user.userId, body.subject);
  }

  @Get('conversations/:id')
  async getConversation(
    @Request() req: any,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    const conversation = await this.chatService.getConversationById(
      id,
      req.user.userId,
      req.user.role,
      cursor,
      limit ? Number(limit) : undefined,
    );

    // Mark unread messages as read (only if it's the first load or we want to mark as read)
    if (!cursor) {
      await this.chatService.markMessagesAsRead(id, req.user.userId);
    }

    return conversation;
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; documentId?: string },
  ) {
    const message: any = await this.chatService.sendMessage(
      id,
      req.user.userId,
      body.content,
      body.documentId,
    );

    // 1. Real-time update to the conversation room (for visible chat)
    this.chatGateway.server
      .to(`conversation_${id}`)
      .emit('newMessage', message);

    // 2. Global Notification to Recipient
    const senderRole = req.user.role;
    const conv = message.conversation;

    if (senderRole === 'CLIENT') {
      // If sender is Client -> Notify assigned preparer OR all admins
      const senderName = message.sender?.name || 'Client';
      if (conv.preparerId) {
        this.chatGateway.server
          .to(`user_${conv.preparerId}`)
          .emit('notification', {
            type: 'message',
            title: senderName, // Use sender name as title
            body: `You have a new message`,
            message: `You have a new message from ${senderName}`,
            senderName: senderName,
            senderId: message.senderId,
            conversationId: id,
            link: `/admin/chat/${id}`,
          });
      } else {
        // If unassigned, notify all admins
        this.chatGateway.server.to('admin_notifications').emit('notification', {
          type: 'message',
          title: senderName, // Use sender name as title
          body: `New message`,
          message: `New message from ${senderName}`,
          senderName: senderName,
          senderId: message.senderId,
          conversationId: id,
          link: `/admin/chat/${id}`,
        });
      }
    } else {
      // If sender is Admin/Preparer -> Notify Client
      if (conv.clientId) {
        // Get notification sender name from company profile
        let senderName = message.sender?.name || 'Support';
        try {
          const companyProfile = await this.companyService.getProfile();
          // Check if company has a custom notification sender name configured
          // If notificationSenderName is set and not empty, use it; otherwise use admin name
          if (companyProfile.notificationSenderName && companyProfile.notificationSenderName.trim() !== '') {
            senderName = companyProfile.notificationSenderName.trim();
          }
          // If notificationSenderName is empty/null/undefined, use admin name (default behavior)
        } catch (error) {
          console.error('Failed to get company profile for notification sender name:', error);
          // Fallback to admin name if error
        }
        
        this.chatGateway.server
          .to(`user_${conv.clientId}`)
          .emit('notification', {
            type: 'message',
            title: senderName, // Use configured name or admin name
            body: message.content.length > 100 ? message.content.substring(0, 97) + '...' : message.content,
            message: message.content,
            senderName: senderName,
            senderId: message.senderId,
            conversationId: id,
            link: `/chat/${id}`,
          });
      }
    }

    return message;
  }

  @Patch('conversations/:id/assign')
  async assignPreparer(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { preparerId: string | null },
  ) {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'PREPARER') {
      throw new NotFoundException('Unauthorized');
    }
    return this.chatService.assignPreparer(id, body.preparerId);
  }

  @Delete('conversations/:id')
  async deleteConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.deleteConversation(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}
