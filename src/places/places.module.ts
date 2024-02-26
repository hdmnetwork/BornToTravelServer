import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from 'src/typeorm/entities/Place';
import { User } from 'src/typeorm/entities/User';
import { PlacesController } from './controllers/places/places.controller';
import { PlacesService } from './services/places/places.service';
import { FavoritesModule } from 'src/favorites/favorites.module';
// import { ApiBackupService } from 'src/apibackup/services/apibackup/apibackup.service';
import { ApibackupModule } from 'src/apibackup/apibackup.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, User]),
    forwardRef(() => FavoritesModule),
    forwardRef(() => ApibackupModule),
  ],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService, TypeOrmModule],
})
export class PlacesModule {}