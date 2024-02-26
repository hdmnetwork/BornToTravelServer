import { Module, forwardRef } from '@nestjs/common';
import { ApiBackupService } from './services/apibackup/apibackup.service';
import { APIBackupStore }  from "src/typeorm/entities/APIBackupStore"
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesModule } from 'src/places/places.module';

@Module({
    imports: [TypeOrmModule.forFeature([APIBackupStore]),
        // PlacesModule
        forwardRef(() => PlacesModule),     ],
    // Pas de controllers ici
    providers: [ApiBackupService],
    exports: [ApiBackupService]
})
export class ApibackupModule {} 
