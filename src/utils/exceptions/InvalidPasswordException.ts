import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidPasswordException extends HttpException {
  constructor(errors: string[]) {
    const errorMessage: string = `Le mot de passe ne satisfait pas les critères de sécurité : ${errors.join(', ')}`;
    super(errorMessage, HttpStatus.BAD_REQUEST);
  }
}
