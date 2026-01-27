import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global Exception Filter for Prisma Errors
 * 
 * SECURITY: This filter prevents database schema information from being exposed to users.
 * All Prisma errors are sanitized and logged internally for debugging.
 * 
 * Users see generic messages, developers see full errors in logs.
 */
@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        // Log full error details for internal debugging (never shown to user)
        this.logger.error(
            `[${request.method}] ${request.url}`,
            exception?.stack || exception,
        );

        // Check if this is a Prisma error
        if (this.isPrismaError(exception)) {
            return this.handlePrismaError(exception, response, request);
        }

        // Check if this is a NestJS HTTP Exception
        if (exception?.getStatus && typeof exception.getStatus === 'function') {
            return this.handleHttpException(exception, response, request);
        }

        // Generic server error (don't expose internal details)
        return this.sendSafeResponse(response, request, {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred. Please try again later.',
            error: 'Internal Server Error',
        });
    }

    /**
     * Check if error is from Prisma
     */
    private isPrismaError(exception: any): boolean {
        return (
            exception?.name?.includes('Prisma') ||
            exception?.code?.startsWith('P') ||
            exception?.clientVersion !== undefined ||
            exception?.message?.includes('prisma') ||
            exception?.message?.includes('PrismaClient') ||
            exception?.message?.includes('Invalid `') ||
            exception?.message?.includes('Cannot fetch data from service')
        );
    }

    /**
     * Handle Prisma-specific errors with sanitized messages
     */
    private handlePrismaError(exception: any, response: Response, request: any) {
        const prismaCode = exception?.code;

        // Log the real error for debugging (with full details)
        this.logger.error(
            `[PRISMA ERROR] Code: ${prismaCode || 'UNKNOWN'}, Message: ${exception?.message}`,
            exception?.stack,
        );

        // Map Prisma error codes to user-friendly messages
        // Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
        const errorMap: Record<string, { status: number; message: string }> = {
            // Connection errors
            P1000: {
                status: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Database service is temporarily unavailable. Please try again in a moment.',
            },
            P1001: {
                status: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Unable to connect to the database. Please try again later.',
            },
            P1002: {
                status: HttpStatus.GATEWAY_TIMEOUT,
                message: 'Database connection timed out. Please try again.',
            },
            P1003: {
                status: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Database is not available. Please contact support if this persists.',
            },
            P1008: {
                status: HttpStatus.GATEWAY_TIMEOUT,
                message: 'Operation timed out. Please try again.',
            },
            P1017: {
                status: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Database connection was closed. Please try again.',
            },

            // Query errors
            P2000: {
                status: HttpStatus.BAD_REQUEST,
                message: 'The provided value is too long for this field.',
            },
            P2001: {
                status: HttpStatus.NOT_FOUND,
                message: 'The requested record does not exist.',
            },
            P2002: {
                status: HttpStatus.CONFLICT,
                message: 'This record already exists. Please use a different value.',
            },
            P2003: {
                status: HttpStatus.BAD_REQUEST,
                message: 'Invalid reference to related record.',
            },
            P2025: {
                status: HttpStatus.NOT_FOUND,
                message: 'Record not found.',
            },
        };

        // Check if we have a mapped error
        if (prismaCode && errorMap[prismaCode]) {
            return this.sendSafeResponse(response, request, {
                statusCode: errorMap[prismaCode].status,
                message: errorMap[prismaCode].message,
                error: this.getErrorName(errorMap[prismaCode].status),
            });
        }

        // Generic Prisma error (don't expose details)
        // Check if it's a connection-related error
        if (
            exception?.message?.includes('fetch failed') ||
            exception?.message?.includes('ECONNREFUSED') ||
            exception?.message?.includes('ETIMEDOUT') ||
            exception?.message?.includes('Cannot fetch data')
        ) {
            return this.sendSafeResponse(response, request, {
                statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                message: 'Database service is temporarily unavailable. Please try again in a few moments.',
                error: 'Service Unavailable',
            });
        }

        // Default Prisma error response
        return this.sendSafeResponse(response, request, {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'A database error occurred. Please try again or contact support.',
            error: 'Database Error',
        });
    }

    /**
     * Handle standard NestJS HTTP exceptions
     */
    private handleHttpException(exception: any, response: Response, request: any) {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        let message = exception.message;

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
            message = (exceptionResponse as any).message || message;
        }

        return this.sendSafeResponse(response, request, {
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            error: this.getErrorName(status),
        });
    }

    /**
     * Send safe response to client (no internal details exposed)
     */
    private sendSafeResponse(
        response: Response,
        request: any,
        error: { statusCode: number; message: string | string[]; error: string },
    ) {
        return response.status(error.statusCode).json({
            success: false,
            statusCode: error.statusCode,
            error: error.error,
            message: error.message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }

    /**
     * Get user-friendly error name from status code
     */
    private getErrorName(statusCode: number): string {
        const errorNames: Record<number, string> = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            504: 'Gateway Timeout',
        };

        return errorNames[statusCode] || 'Error';
    }
}
