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
import { SMSModule } from '../sms/sms.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret:
                process.env.JWT_SECRET ||
                (() => {
                    throw new Error('JWT_SECRET environment variable is required');
                })(),
            signOptions: { expiresIn: '30d' },
        }),
        EmailModule,
        ChatModule,
        PinModule,
        SMSModule,
    ],
    providers: [
        AuthService,
        PrismaService,
        EncryptionService,
        JwtStrategy,
        TwoFactorService,
        TokenService,
    ],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
