import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoritePlace } from 'src/typeorm/entities/FavoritePlace';
import { FavoritesController } from './controllers/favorites/favorites.controller';
import { FavoritesService } from './services/favorites/favorites.service';
import { PlacesModule } from 'src/places/places.module'; // Importez PlacesModule
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoritePlace]),
    PlacesModule, // Assurez-vous que PlacesModule est importé ici
    UsersModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}