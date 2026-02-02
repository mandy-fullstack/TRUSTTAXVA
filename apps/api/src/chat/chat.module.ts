import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';

import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [ChatService, PrismaService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
