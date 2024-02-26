import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { User } from './User';
import { FavoritePlace } from './FavoritePlace';
import { Exclude } from 'class-transformer';

@Entity({ name: 'places' })
export class Place {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type:"varchar", default: null })
  name: string;

  @Exclude()
  @Column({type:"varchar", unique: true })
  reference: string; // Assurez-vous que la référence est unique, c'est l'id de API

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

  @OneToMany(() => FavoritePlace, (favoritePlace) => favoritePlace.place) // Configurez la relation
  favoritePlaces: FavoritePlace[]; // Assurez-vous d'avoir cette propriété dans votre entité

  // @ManyToMany(() => User, (user) => user.favoritePlaces)
  // @JoinTable({
  //   name: 'favorite_places',
  //   joinColumn: { name: 'place_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  // })
  // users: User[];
 
}
