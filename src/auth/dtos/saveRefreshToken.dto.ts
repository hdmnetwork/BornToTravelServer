import { IsString } from "class-validator";

export class saveRefreshTokenDto {
  @IsString()
  refreshToken: string;
}
