import { ConflictException } from '@nestjs/common';

export class DuplicateFieldException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
