import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn(("uuid"))
  id: string;

  @Column({type: "varchar", unique: true})
  refreshToken: string;

  @Column("uuid") // Utiliser une colonne de type number pour la clé étrangère
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  user: User;

}
