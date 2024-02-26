import { IsArray, IsNumber, IsString } from "class-validator";

export class CreatePlaceDto {
  @IsString()
  name?: string;
  @IsString()
  localite?: string;
  @IsString()
  categorieApi?: string;
  @IsString()
  categorie?: string;
  @IsString()
  telephone?: string;
  @IsString()
  adresse?: string;
  @IsArray()
  @IsNumber({}, { each: true})
  geolocalisation?: number[];
}
