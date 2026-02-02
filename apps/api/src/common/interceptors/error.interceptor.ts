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
        
        // Log the full error to the console for debugging (especially on Render)
        console.error('[ErrorInterceptor] Caught error:', {
          method,
          url,
          message: err.message,
          name: err.name,
          stack: err.stack,
          response: err.getResponse ? err.getResponse() : undefined,
          // Log the original error if it exists
          originalError: err.originalError || err.cause || undefined,
          // Log all error properties
          errorKeys: Object.keys(err),
        });
        
        // If there's an original error, log it separately
        if (err.originalError) {
          console.error('[ErrorInterceptor] Original error:', {
            message: err.originalError.message,
            stack: err.originalError.stack,
            name: err.originalError.name,
          });
        }

        const status =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        // Don't expose internal error details
        const message =
          err instanceof HttpException
            ? err.message
            : 'An unexpected error occurred';

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
