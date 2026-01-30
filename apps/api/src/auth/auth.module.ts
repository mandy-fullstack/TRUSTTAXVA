import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/services/encryption.service';
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TwoFactorService } from './two-factor.service';
import { ChatModule } from '../chat/chat.module';
import { PinModule } from './pin/pin.module';
import { TokenService } from './token.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            signOptions: { expiresIn: '30d' },
        }),
        EmailModule,
        ChatModule,
        PinModule,
    ],
    providers: [AuthService, PrismaService, EncryptionService, JwtStrategy, TwoFactorService, TokenService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
