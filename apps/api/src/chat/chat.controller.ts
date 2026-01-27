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
        const message = await this.chatService.sendMessage(id, req.user.userId, body.content);

        // Real-time update via Socket
        this.chatGateway.server.to(`conversation_${id}`).emit('newMessage', message);

        // Optional: Send push notification logic here if needed, 
        // e.g. finding the other participant and emitting to their personal room 'user_{id}'

        return message;
    }

    @Delete('conversations/:id')
    async deleteConversation(@Request() req: any, @Param('id') id: string) {
        return this.chatService.deleteConversation(id, req.user.userId, req.user.role);
    }
}
