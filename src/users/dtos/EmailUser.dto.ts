import { IsString } from "class-validator";
import { FindOperator } from "typeorm";

export class EmailUserDto {
    @IsString()
    email: string | FindOperator<string>;
}