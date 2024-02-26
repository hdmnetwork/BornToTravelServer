import { ConflictException } from '@nestjs/common';

export class PartialUpdateException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
