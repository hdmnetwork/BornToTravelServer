import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidFieldException extends HttpException {
  constructor(field: string) {
    super(`Le champ ${field} doit contenir au moins une lettre, ne peut pas commencer ni finir par un espace, et peut inclure des chiffres et des symboles à l'intérieur.`, HttpStatus.BAD_REQUEST);
  }
}
