import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Error Interceptor for HTTP responses
 *
 * NOTE: This interceptor works alongside PrismaExceptionFilter.
 * The filter handles Prisma errors, this interceptor handles HTTP errors.
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;
        // IMPORTANT:
        // - Don't wrap HttpExceptions; PrismaExceptionFilter already formats them.
        // - Avoid logging 4xx as "errors" (noise in production logs).
        if (err instanceof HttpException) {
          const status = err.getStatus();
          if (status >= 500) {
            console.error('[ErrorInterceptor] HTTP 5xx:', {
              method,
              url,
              status,
              message: err.message,
            });
          }
          return throwError(() => err);
        }

        // Non-HttpException errors: log and sanitize
        console.error('[ErrorInterceptor] Non-HTTP error:', {
          method,
          url,
          message: err?.message,
          name: err?.name,
          stack: err?.stack,
        });

        const status = HttpStatus.INTERNAL_SERVER_ERROR;

        // Don't expose internal error details
        const message = 'An unexpected error occurred';

        // Preserve original error information in the new exception
        const response = {
          success: false,
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
        };

        // Create new exception but preserve original error
        const httpException = new HttpException(response, status);
        // Attach original error for logging purposes
        (httpException as any).originalError = err;
        
        return throwError(() => httpException);
      }),
    );
  }
}
