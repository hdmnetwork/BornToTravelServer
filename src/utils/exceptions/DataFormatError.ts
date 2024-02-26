import { BadRequestException } from '@nestjs/common';

export class DataFormatError extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}