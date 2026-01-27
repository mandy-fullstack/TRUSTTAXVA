import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from '../prisma/prisma.service';

import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
    providers: [ChatService, PrismaService, ChatGateway, JwtService],
    controllers: [ChatController],
    exports: [ChatService, ChatGateway],
})
export class ChatModule { }
