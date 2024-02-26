import { IsBoolean, IsString } from 'class-validator';

export class createRefreshTokenDto {
  @IsString()
  id: string;
  @IsString()
  email: string;
  @IsString()
  firstname?: string;
  @IsString()
  lastname?: string;
  @IsString()
  pseudeo?: string;
  @IsBoolean()
  isElectricCar?: boolean;
}
