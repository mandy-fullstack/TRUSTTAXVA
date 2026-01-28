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
import { FirebaseModule } from './common/firebase.module';

@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window: 60 seconds
      limit: 10, // Max 10 requests per window (default)
    }]),
    AuthModule,
    ServicesModule,
    AdminModule,
    CompanyModule,
    FormsModule,
    OrdersModule,
    FaqModule,
    ChatModule,
    FirebaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
