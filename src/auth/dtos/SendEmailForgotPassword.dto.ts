// send-email-forgot-password.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendEmailForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;
}
