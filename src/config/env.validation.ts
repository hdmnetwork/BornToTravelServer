/*
* La validation du fichier .env est effectuée par le package dotenv-safe
* Cela permet de vérifier que toutes les variables d'environnement requises sont bien présentes
* Et eviter de comportement inattendu de l'application, si par exemple, on oublie de définir une variable d'environnement comme DATABASE_HOST
*/
import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsString, IsNumber, IsNotEmpty, validateSync, IsEnum, ValidationError} from "class-validator"
import { IsSynchronizeValid } from './validateDecoratorSynchronize';

enum Environement{
    DEVELOPMENT = "development",
    PRODUCTION = "production",
    TEST = "test",
    provision = "provision",
}

 class EnvironementVariables {

    @IsEnum(Environement)
    NODE_ENV: Environement;

    @IsString()
    @IsNotEmpty()
    DATABASE_HOST: string;

    @IsNumber()
    @IsNotEmpty()
    DATABASE_PORT: number;

    @IsString()
    @IsNotEmpty()
    DATABASE_USERNAME: string;

    @IsString()
    // @IsNotEmpty()
    DATABASE_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    DATABASE_DATABASE: string;

    @IsBoolean()
    @IsSynchronizeValid()
    DATABASE_SYNCHRONIZE: boolean;

    @IsBoolean()
    @IsNotEmpty()
    DATABASE_SUPPORTBIGNUMBERS: boolean;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig: EnvironementVariables = plainToInstance(
        EnvironementVariables,
        config,
        { enableImplicitConversion: true },
    );

    const errors: ValidationError[] = validateSync(validatedConfig, { skipMissingProperties: false, skipNullProperties: false, skipUndefinedProperties: false})

    if(errors.length > 0) {
        throw new Error(errors.toString())
    }else{
        return validatedConfig;
    }
}