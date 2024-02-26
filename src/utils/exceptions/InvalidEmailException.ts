import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEmailException extends HttpException {
  constructor() {
    super('Format d\'adresse e-mail invalide', HttpStatus.BAD_REQUEST);
  }
}
 