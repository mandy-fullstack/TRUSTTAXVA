import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: true, // Throw error on unknown properties
    transform: true, // Auto-transform to DTO classes
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // SECURITY: Apply Prisma exception filter to prevent database schema exposure
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
