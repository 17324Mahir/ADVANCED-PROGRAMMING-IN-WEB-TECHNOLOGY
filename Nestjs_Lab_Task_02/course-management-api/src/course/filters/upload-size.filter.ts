import {
  BadRequestException,
  Catch,
  PayloadTooLargeException,
} from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';

@Catch(PayloadTooLargeException)
export class UploadSizeFilter implements ExceptionFilter<PayloadTooLargeException> {
  catch(_exception: PayloadTooLargeException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = new BadRequestException('File must be smaller than 2 MB');

    response.status(error.getStatus()).json(error.getResponse());
  }
}
