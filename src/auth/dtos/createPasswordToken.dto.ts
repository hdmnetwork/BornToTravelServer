import { IsString } from "class-validator";

export class createPasswordTokenDto {
  @IsString()
  email: string;
}
