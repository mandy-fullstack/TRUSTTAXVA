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

  // CORS configuration - usar variables de entorno
  const isProduction = process.env.NODE_ENV === 'production';
  let allowedOrigins: string[];

  if (isProduction) {
    const corsOrigins = process.env.CORS_ORIGINS;
    if (!corsOrigins || corsOrigins.trim() === '') {
      console.error('⚠️ [CORS] CORS_ORIGINS no configurado en producción');
      allowedOrigins = [];
    } else {
      allowedOrigins = corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);
    }
  } else {
    // Desarrollo: permitir cualquier localhost
    allowedOrigins = [];
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }

      // En desarrollo, permitir cualquier localhost
      if (
        !isProduction &&
        (origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:'))
      ) {
        return callback(null, true);
      }

      // En producción, verificar lista
      if (allowedOrigins.length === 0) {
        if (isProduction) {
          return callback(
            new Error('CORS: Origin not allowed. CORS_ORIGINS not configured.'),
          );
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: Origin ${origin} is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
      skipMissingProperties: true,
    }),
  );

  // SECURITY: Apply Prisma exception filter to prevent database schema exposure
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
