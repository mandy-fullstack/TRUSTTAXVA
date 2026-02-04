import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { AdminModule } from './admin/admin.module';
import { CompanyModule } from './company/company.module';
import { FormsModule } from './forms/forms.module';
import { OrdersModule } from './orders/orders.module';
import { FaqModule } from './faq/faq.module';
import { ChatModule } from './chat/chat.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DocumentsModule } from './documents/documents.module';
import { SMSModule } from './sms/sms.module';
import { EmailModule } from './email/email.module';
import { PortalModule } from './portal/portal.module';
import { FirebaseModule } from './common/firebase.module';
import { RedisModule } from './common/services/redis.module';
import { SharedModule } from './common/shared.module';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';

@Module({
  imports: [
    AuthModule,
    // Rate limiting configuration with Redis storage for global consistency
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
          ttl: 60000,
          limit: 10,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          keyPrefix: 'tt:throttle:',
            tls:
              (process.env.REDIS_URL || '').startsWith('rediss://') ||
              (process.env.REDIS_URL || '').includes('upstash.io')
                ? {}
                : undefined,
          }),
        ),
      }),
    }),
    AuthModule,
    ServicesModule,
    AdminModule,
    CompanyModule,
    FormsModule,
    OrdersModule,
    InvoicesModule,
    FaqModule,
    ChatModule,
    DocumentsModule,
    SMSModule,
    EmailModule,
    PortalModule,
    FirebaseModule,
    RedisModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
