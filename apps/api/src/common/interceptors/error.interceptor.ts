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
                const status =
                    err instanceof HttpException
                        ? err.getStatus()
                        : HttpStatus.INTERNAL_SERVER_ERROR;

                // Don't expose internal error details
                const message = err instanceof HttpException
                    ? err.message
                    : 'An unexpected error occurred';

                const response = {
                    success: false,
                    statusCode: status,
                    message,
                    timestamp: new Date().toISOString(),
                    path: context.switchToHttp().getRequest().url,
                };

                return throwError(() => new HttpException(response, status));
            }),
        );
    }
}
