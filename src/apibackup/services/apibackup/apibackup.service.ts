import { Injectable, OnModuleInit, Logger, InternalServerErrorException, NotFoundException, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { APIBackupStore } from "src/typeorm/entities/APIBackupStore";
import { Repository } from "typeorm";
import { PlacesService } from '../../../places/services/places/places.service';
import { AllPlacesType } from "src/places/type/AllPlacesDataType.type";
import { Cron } from "@nestjs/schedule";



@Injectable()
export class ApiBackupService implements OnModuleInit {
    private readonly logger = new Logger(ApiBackupService.name);
    // private externalData: (APIBackupStore & AllPlacesType)[] = []; // Etat partagé.

    constructor(
        @InjectRepository(APIBackupStore) private apiBackUpRepository: Repository<APIBackupStore>,
        @Inject(forwardRef(() => PlacesService))
        private placesService: PlacesService
    ) {}

    async onModuleInit() {
        await this.populateDBWithApiDatas();
    }

    @Cron('0 0 * * 0')
    async populateDBWithApiDatas(): Promise<void> {
        try {
            const allPlaces: AllPlacesType[] = await this.placesService.fetchAllPlaces();
            if (allPlaces.length === 0 || !Array.isArray(allPlaces)) {
                this.logger.warn("Aucune donnée récupérée de l'API externe. Mise à jour annulée");
                return;
            }
            await this.saveApiDataToDbFromExternalApi(allPlaces);
        } catch (error) {
            this.logger.error("Erreur lors de la récupération des données de l'API externe", error.stack);
            throw new InternalServerErrorException(`Erreur serveur interne: ${error.message}`);
        }
    }

    async saveApiDataToDbFromExternalApi(allPlaces: AllPlacesType[]){
        const savePromises: Promise<APIBackupStore>[] = allPlaces.map(async place => {
            if (!place.reference) {
                this.logger.error("Aucune référence trouvée pour ce lieu", place);
                return;
            }

            const placeExists: APIBackupStore = await this.apiBackUpRepository.findOne({ where: { reference: place.reference } });
            if (!placeExists) {
                let newPlace: APIBackupStore = new APIBackupStore();
                Object.assign(newPlace, place);
                return this.apiBackUpRepository.save(newPlace);
            }
        });

        try {
            await Promise.all(savePromises);
            await this.fetchDataFromBackupApi(); // Utilisation des données sauvegardées dans la base de données.
        } catch (error) {
            this.logger.error("Erreur lors de l'enregistrement des données dans la base de données", error.stack);
            throw new InternalServerErrorException(`Erreur serveur interne: ${error.message}`);
        }
    } 

    async fetchDataFromBackupApi() {
        try {
            const allPlacesData: APIBackupStore[] = await this.apiBackUpRepository.find();
            if (allPlacesData.length === 0 || !Array.isArray(allPlacesData)) {
                throw new NotFoundException("Aucune donnée trouvée dans la base de données de l'API Backup");
            }
            return allPlacesData;
        } catch (error) {
            this.logger.error("Erreur lors de la récupération des données de la base de données", error.stack);
            throw new InternalServerErrorException(`Erreur serveur de la base de données interne: ${error.message}`);
        }
    } 
}
