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
import { ChatService } from './chat.service';
import { ClientToServerEvents, ServerToClientEvents } from '@trusttax/core';
import { RedisService } from '../common/services/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
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

      // Track presence in Redis
      await this.redisService.set(`presence:${payload.sub}`, {
        status: 'online',
        lastSeen: new Date().toISOString(),
        socketId: client.id,
      });

      // Broadcast status change to admin room if it's a client
      if (payload.role === 'CLIENT') {
        this.server.to('admin_notifications').emit('userStatusChanged' as any, {
          userId: payload.sub,
          status: 'online',
        });
      }

      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (e) {
      console.error('Connection unauthorized', e.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      // Remove presence from Redis or update to offline
      await this.redisService.del(`presence:${userId}`);

      // Broadcast status change
      if (client.data.user?.role === 'CLIENT') {
        this.server.to('admin_notifications').emit('userStatusChanged' as any, {
          userId,
          status: 'offline',
        });
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    // Broadcast to the conversation room EXCEPT the sender
    client.broadcast
      .to(`conversation_${payload.conversationId}`)
      .emit('userTyping', {
        userId: client.data.user?.sub,
        userName: client.data.user?.name,
        isTyping: payload.isTyping,
        conversationId: payload.conversationId,
      });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    // Save message via service
    const message = await this.chatService.sendMessage(
      payload.conversationId,
      user.sub,
      payload.content,
    );

    // Emit to room
    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('newMessage', message);

    return message;
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    // Mark messages as read in database
    await this.chatService.markMessagesAsRead(payload.conversationId, user.sub);

    // Emit to conversation room that messages were read
    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('messagesRead', {
        conversationId: payload.conversationId,
        userId: user.sub,
      });
  }

  @SubscribeMessage('markAsDelivered')
  async handleMarkAsDelivered(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const user = client.data.user;
    if (!user) return;

    // Mark messages as delivered in database
    await this.chatService.markMessagesAsDelivered(
      payload.conversationId,
      user.sub,
    );

    // Emit to conversation room that messages were delivered
    this.server
      .to(`conversation_${payload.conversationId}`)
      .emit('messagesDelivered', {
        conversationId: payload.conversationId,
        userId: user.sub,
      });
  }
}
