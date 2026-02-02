import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ErrorInterceptor } from './common/interceptors/error.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { validateEnv } from './common/config/env.validation';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';

async function bootstrap() {
  // Validate environment variables before starting
  validateEnv();
  const app = await NestFactory.create(AppModule);

  // CORS configuration - restrict origins in production
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGINS?.split(',') || []
      : [
          'http://localhost:5175',
          'http://localhost:5176',
          'http://localhost:3000',
        ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform to DTO classes
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // SECURITY: Apply Prisma exception filter to prevent database schema exposure
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
