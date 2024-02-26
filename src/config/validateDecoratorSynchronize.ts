// Creation de décorateur personnalisée pour éxclure le syncrhonise de database de mode production
import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import * as dotenv from 'dotenv';

dotenv.config();

@ValidatorConstraint({ async: true })
class IsSynchronizeValideConstraint implements ValidatorConstraintInterface {
    validate(synchronize: boolean, args: ValidationArguments): boolean{
        const nodeEnv: string = process.env.MY_APP_NODE_ENV;
        const nodeEnvArr: string[] = nodeEnv.split(",")
        const nodeEnvDeveloppement: string = nodeEnvArr[0];

        !nodeEnv ? console.log("NODE_ENV n'est pas défini") : console.log("NODE_ENV est défini", nodeEnv);
        
        if(nodeEnvDeveloppement === "production" && synchronize === true){
            console.log("!DANGER!::Synchronize doit être à false en mode production");
            return false;
        }else{
            return true;
        }
    }

    defaultMessage(args?: ValidationArguments): string {
        return `Synchronize doit être à false en mode production ${args}`;
    }
}

export function IsSynchronizeValid(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyKey: string){
        registerDecorator({
            name: "IsSynchronizeValid",
            target: object.constructor,
            propertyName: propertyKey,
            options: validationOptions,
            constraints: [],
            validator: IsSynchronizeValideConstraint
        })
    }
}