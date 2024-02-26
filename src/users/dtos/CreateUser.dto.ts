import { IsBoolean, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  firstname: string;
  @IsString()
  lastname: string;
  @IsString()
  pseudo: string;
  @IsString()
  password: string;
  @IsString()
  email: string;
  @IsBoolean()
  isElectricCar: boolean; 
}
