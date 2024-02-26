import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';
import { Place } from './Place';

@Entity()
export class FavoritePlace {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.favoritePlaces)
  user: User;

  @ManyToOne(() => Place, (place) => place.favoritePlaces)
  place: Place;
}
