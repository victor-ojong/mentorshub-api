import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { config } from '@app/config';
import { Response, Request } from 'express';
import { MongooseError } from 'mongoose';
import { mongooseErrorHandler } from './handleMongooseError';

interface HttpExceptionResponse {
  statusCode: number;
  error: string;
}

interface CustomHttpExceptionResponse extends HttpExceptionResponse {
  path: string;
  method: string;
  timeStamp: Date;
}

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage =
        (errorResponse as BadRequestException).message ||
        (errorResponse as HttpExceptionResponse).error ||
        exception.message;
    } else if (exception instanceof MongooseError) {
      const { status: mongooseErrorStatus, message } =
        mongooseErrorHandler(exception);
      status = mongooseErrorStatus;
      errorMessage = message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorMessage = 'Critical internal server error occurred!';
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);
    const errorLog = this.getErrorLog(errorResponse, request, exception);
    this.writeLog(errorLog);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string | string[],
    request: Request
  ): any =>
    Object.assign(
      {
        statusCode: status,
        path: request.url,
        method: request.method,
        timeStamp: new Date(),
      },
      Array.isArray(errorMessage)
        ? { errors: errorMessage }
        : { error: errorMessage }
    );

  private getErrorLog = (
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: Error
  ): string => {
    const { statusCode } = errorResponse;
    const { method, url } = request;
    const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url}\n
      ${JSON.stringify(errorResponse)}\n
      ${exception.stack}\n\n`;
    return errorLog;
  };

  private writeLog = (errorLog: string): void => {
    if (config.env !== 'test') {
      Logger.error(errorLog);
    }
  };
}
