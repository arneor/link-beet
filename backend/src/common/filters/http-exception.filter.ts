import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        // Handle NestJS HttpExceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || message;
                errors = responseObj.errors || null;
            }
        }
        // Handle Prisma "Known Request" Errors (e.g. unique constraint failed)
        else if (exception && (exception as any).name === 'PrismaClientKnownRequestError') {
            const prismaError = exception as any;
            this.logger.error(`Prisma Client Known Request Error: ${prismaError.message}`, prismaError.stack);

            // P2002: Unique constraint violation
            if (prismaError.code === 'P2002') {
                status = HttpStatus.CONFLICT;
                const target = prismaError.meta?.target;
                message = target ? `${target} already exists` : 'Unique constraint violation';
            } else {
                // For other Prisma known request errors (like connection/fetch failed within a specific request), 
                // treat as internal or service unavailable depending on context, but give a friendly message.
                message = 'Database operation failed. Please try again later.';
            }
        }
        // Handle Prisma Initialization Errors (Connection failed)
        else if (exception && (exception as any).name === 'PrismaClientInitializationError') {
            const prismaError = exception as any;
            this.logger.error(`Prisma Initialization Error: ${prismaError.message}`, prismaError.stack);
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = 'Database service currently unavailable';
        }
        // Handle Prisma Validation/Other Errors
        else if (exception && ((exception as any).name === 'PrismaClientValidationError' || (exception as any).name === 'PrismaClientRustPanicError' || (exception as any).name === 'PrismaClientUnknownRequestError')) {
            const prismaError = exception as any;
            this.logger.error(`Prisma Client Error [${prismaError.name}]: ${prismaError.message}`, prismaError.stack);
            message = 'A database error occurred';
        }
        // Handle Generic Errors
        else if (exception instanceof Error) {
            this.logger.error(`Unhandled exception: ${exception.message}`, exception.stack);
            // In production, we should NOT send the raw error message to the client for security.
            // Using a generic message for "user friendly" requirement.
            message = 'An unexpected error occurred. Please contact support.';
        }

        const errorResponse = {
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...(errors && { errors }),
        };

        response.status(status).json(errorResponse);
    }
}
