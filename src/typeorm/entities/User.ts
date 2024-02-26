import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { RefreshToken } from './RefreshToken';
// import { Place } from './Place';
import { FavoritePlace } from './FavoritePlace';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type: 'varchar', nullable: true })
  firstname: string;

  @Column({type: 'varchar',  nullable: true })
  lastname: string;

  @Column({type: 'varchar',  nullable: true })
  pseudo: string;

  @Column({type: 'varchar',  unique: true })
  email: string;

  @Exclude()
  @Column({type: 'varchar',  nullable: false })
  password: string; 

  @Exclude()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({type: 'tinyint', default: false })
  isElectricCar: boolean;

  @Exclude()
  @Column({type: 'varchar', default: null })
  resetPasswordToken: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiration: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.userId) 
  refreshTokens: RefreshToken[];

  @OneToMany(() => FavoritePlace, (favoritePlace) => favoritePlace.user) // Configurez la relation
  favoritePlaces: FavoritePlace[]; // Assurez-vous d'avoir cette propriété dans votre entité

  // @ManyToMany(() => Place, (place) => place.users)
  // @JoinTable({
  //   name: 'favorite_places',
  //   joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'place_id', referencedColumnName: 'id' },
  // })
  // favoritePlaces: Place[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
