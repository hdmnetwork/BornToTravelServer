import { Exclude } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'apibackupstore'})
export class APIBackupStore {
    @PrimaryGeneratedColumn('uuid' )
    @Exclude()
    id: number;
  
    @Exclude()
    @Column({type:"varchar", unique: true })
    reference: string; // Assurez-vous que la référence est unique, c'est l'id de API

    @Column({type:"varchar", default: null })
    name: string;
  
    @Column({type:"varchar", default: null })
    localite: string;
  
    @Exclude()
    @Column({type:"varchar", default: null })
    categorieApi: string;
  
    @Column({type:"varchar", default: null })
    categorie: string;
  
    @Exclude()
    @Column({type:"varchar", default: null })
    telephone: string;
  
    @Column({type:"varchar", default: null })
    adresse: string;
  
    @Exclude()
    @Column('json', { nullable: true }) // Utilisez 'json' au lieu de 'jsonb' si votre base de données ne prend pas en charge JSONB
    chargepoint: Record<string, any> | null; // Utilisez le type approprié pour vos données de chargepoint
  
    @Exclude()
    @Column('simple-array', {nullable: true })
    geolocalisation: [number, number];
  
}