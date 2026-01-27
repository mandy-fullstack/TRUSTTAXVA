import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

import { ChatGateway } from './chat.gateway';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway
    ) { }

    @Get('conversations')
    async getConversations(@Request() req: any) {
        return this.chatService.getConversations(req.user.userId, req.user.role);
    }

    @Post('conversations')
    async createConversation(@Request() req: any, @Body() body: { subject?: string }) {
        return this.chatService.createConversation(req.user.userId, body.subject);
    }

    @Get('conversations/:id')
    async getConversation(@Request() req: any, @Param('id') id: string) {
        const conversation = await this.chatService.getConversationById(id, req.user.userId, req.user.role);

        // Mark unread messages as read
        await this.chatService.markMessagesAsRead(id, req.user.userId);

        return conversation;
    }

    @Post('conversations/:id/messages')
    async sendMessage(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { content: string }
    ) {
        const message: any = await this.chatService.sendMessage(id, req.user.userId, body.content);

        // 1. Real-time update to the conversation room (for visible chat)
        this.chatGateway.server.to(`conversation_${id}`).emit('newMessage', message);

        // 2. Global Notification to Recipient
        const senderRole = req.user.role;
        const conv = message.conversation;

        if (senderRole === 'CLIENT') {
            // If sender is Client -> Notify assigned preparer OR all admins
            if (conv.preparerId) {
                this.chatGateway.server.to(`user_${conv.preparerId}`).emit('notification', {
                    type: 'message',
                    title: 'New Message',
                    message: `You have a new message from ${message.sender?.name || 'Client'}`,
                    conversationId: id
                });
            } else {
                // If unassigned, notify all admins
                this.chatGateway.server.to('admin_notifications').emit('notification', {
                    type: 'message',
                    title: 'Unassigned Message',
                    message: `New message from ${message.sender?.name || 'Client'} in unassigned chat`,
                    conversationId: id
                });
            }
        } else {
            // If sender is Admin/Preparer -> Notify Client
            if (conv.clientId) {
                this.chatGateway.server.to(`user_${conv.clientId}`).emit('notification', {
                    type: 'message',
                    title: 'New Message from Support',
                    message: message.content, // Maybe truncate?
                    conversationId: id
                });
            }
        }

        return message;
    }

    @Delete('conversations/:id')
    async deleteConversation(@Request() req: any, @Param('id') id: string) {
        return this.chatService.deleteConversation(id, req.user.userId, req.user.role);
    }
}
