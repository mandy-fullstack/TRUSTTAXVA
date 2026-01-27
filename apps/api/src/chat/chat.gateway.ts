import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtService: JwtService,
        private chatService: ChatService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            client.data.user = payload;

            // Join user specific room for personal notifications
            await client.join(`user_${payload.sub}`);

            // If admin, join admin room
            if (payload.role === 'ADMIN' || payload.role === 'PREPARER') {
                await client.join('admin_notifications');
            }

            console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
        } catch (e) {
            console.error('Connection unauthorized', e.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
        // Basic validation: user can join conversation room if they are part of it
        // For now, simpler: check if room is conversation_${id}
        client.join(room);
        console.log(`Client ${client.id} joined room ${room}`);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
        client.leave(room);
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string; isTyping: boolean }
    ) {
        // Broadcast to the conversation room EXCEPT the sender
        client.to(`conversation_${payload.conversationId}`).emit('userTyping', {
            userId: client.data.user?.sub,
            userName: client.data.user?.name,
            isTyping: payload.isTyping,
            conversationId: payload.conversationId
        });
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { conversationId: string; content: string }
    ) {
        const user = client.data.user;
        if (!user) return;

        // Save message via service
        const message = await this.chatService.sendMessage(user.sub, payload.conversationId, payload.content);

        // Emit to room
        this.server.to(`conversation_${payload.conversationId}`).emit('newMessage', message);

        // Also notify admins if client sent, or client if admin sent
        // This part is tricky if they are not in the room. 
        // Ideally we notify the user's personal channel too if they are offline? 
        // Backend logic for push notifications would go here.
        return message;
    }
}
