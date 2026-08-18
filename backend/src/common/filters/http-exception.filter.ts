import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError, ErrorCode } from '../errors';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: ErrorCode | string = 'INTERNAL_ERROR';
    let message = '服务器内部错误';
    let details: unknown;

    if (exception instanceof AppError) {
      status = exception.status;
      code = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null && 'message' in body) {
        message = Array.isArray((body as { message: unknown }).message)
          ? (body as { message: string[] }).message.join('；')
          : String((body as { message: unknown }).message);
      } else {
        message = exception.message;
      }
      if (status === HttpStatus.UNAUTHORIZED) code = 'AUTH_UNAUTHORIZED';
      else if (status === HttpStatus.TOO_MANY_REQUESTS) code = 'AUTH_RATE_LIMITED';
      else code = 'VALIDATION_ERROR';
      details = typeof body === 'object' ? body : undefined;
    } else {
      this.logger.error(exception);
    }

    const payload: ErrorBody = { error: { code, message } };
    if (details !== undefined) payload.error.details = details;
    res.status(status).json(payload);
  }
}
