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
  const isProduction = process.env.NODE_ENV === 'production';

  let allowedOrigins: string[];

  if (isProduction) {
    // En producción, usar CORS_ORIGINS de variables de entorno
    const corsOrigins = process.env.CORS_ORIGINS;

    if (!corsOrigins || corsOrigins.trim() === '') {
      console.error(
        '⚠️ [CORS] CORS_ORIGINS no está configurado en producción!',
      );
      console.error(
        '⚠️ [CORS] Esto causará errores CORS. Configura CORS_ORIGINS en Render.com',
      );
      console.error(
        '⚠️ [CORS] Ejemplo: CORS_ORIGINS=https://trusttaxllc.com,https://admin.trusttaxllc.com',
      );
      // En producción, si no está configurado, usar array vacío (bloqueará todo)
      allowedOrigins = [];
    } else {
      // Limpiar espacios y dividir por comas
      allowedOrigins = corsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

      console.log(
        '✅ [CORS] Orígenes permitidos en producción:',
        allowedOrigins,
      );
    }
  } else {
    // En desarrollo, permitir localhost
    allowedOrigins = [
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
    ];
    console.log(
      '✅ [CORS] Modo desarrollo - Orígenes permitidos:',
      allowedOrigins,
    );
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir requests sin origen (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Verificar si el origen está permitido
      if (allowedOrigins.length === 0) {
        // Si no hay orígenes configurados en producción, bloquear
        if (isProduction) {
          console.warn(
            '⚠️ [CORS] Origen bloqueado (CORS_ORIGINS vacío):',
            origin,
          );
          return callback(
            new Error('CORS: Origin not allowed. CORS_ORIGINS not configured.'),
          );
        }
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn('⚠️ [CORS] Origen no permitido:', origin);
      console.warn('⚠️ [CORS] Orígenes permitidos:', allowedOrigins);
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
    }),
  );

  // SECURITY: Apply Prisma exception filter to prevent database schema exposure
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalInterceptors(new ErrorInterceptor());

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
