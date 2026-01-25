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

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((err) => {
                const status =
                    err instanceof HttpException
                        ? err.getStatus()
                        : HttpStatus.INTERNAL_SERVER_ERROR;

                const response = {
                    success: false,
                    statusCode: status,
                    message: err.message || 'Internal server error',
                    timestamp: new Date().toISOString(),
                    path: context.switchToHttp().getRequest().url,
                };

                return throwError(() => new HttpException(response, status));
            }),
        );
    }
}
