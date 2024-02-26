import {
    BadGatewayException,
    BadRequestException,
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
    forwardRef
 } from '@nestjs/common';
 import {
    InjectRepository
 } from '@nestjs/typeorm';
 import {
    FilteredMuseumRecordInterface,
    MuseumApiResponseInterface,
    MuseumRecordInterface
 } from 'src/places/interface/FetchAPIMuseum.interface';
 import {
    Place
 } from 'src/typeorm/entities/Place';
 import {
    extractCategories
 } from 'src/places/utils/extractCategory';
 import {
    Repository
 } from 'typeorm';
 
 import * as env from 'dotenv';
 import {
    FilteredMonumentRecordInterface,
    MonumentApiResponseInterface,
    MonumentRecordInterface
 } from 'src/places/interface/FetchApiMonument.interface';
 import {
    FilteredPointOfViewApiRecordInterface,
    PointOfViewApiResponseInterface,
    PointOfViewRecordInterface
 } from 'src/places/interface/FetchApiPointOfView.interface';
 import {
    FilteredTouristOfficeInterface,
    TouristOfficeApiResponseInterface,
    TouristOfficeInterface
 } from 'src/places/interface/FetchApiTouristOffice.interface';
 import {
    DivertissementApiRecordInterface,
    DivertissementApiResponseInterface
 } from 'src/places/interface/FetchApiDivertissement.interface';
 import {
    ChargePointsApiResponseInterface,
    ChargePointsInterface,
    FilteredChargePointsInterface
 } from 'src/places/interface/FetchApiChargePonints.interface';
 import {
    AllPlacesType
 } from 'src/places/type/AllPlacesDataType.type';
 import {
    DataFormatError
 } from 'src/utils/exceptions/DataFormatError';
 import {
    CACHE_MANAGER
 } from '@nestjs/cache-manager';
 import {
    Cache
 } from 'cache-manager';
import { ApiBackupService } from 'src/apibackup/services/apibackup/apibackup.service';
import { APIBackupStore } from 'src/typeorm/entities/APIBackupStore';
 
 env.config();
 
 @Injectable()
 export class PlacesService {
    constructor(
       @InjectRepository(Place) private placeRepository: Repository < Place > ,
       @Inject(CACHE_MANAGER) private cacheService: Cache,
       @Inject(forwardRef(() => ApiBackupService))
       private apiBackupService: ApiBackupService    ) {}



    /**
     * Vérifie si un lieu existe par référence dans la base de données.
     * @param placeReference - Référence du lieu à vérifier.
     * @returns Vrai si le lieu existe, sinon faux.
     */
    async isPlaceExistsByReferenceOnBDDPlace(placeId: string): Promise < boolean > {
       try {
          if (placeId === undefined || placeId === null) {
             return false;
          }
 
          const existingPlace: Place = await this.placeRepository.findOne({
             where: {
                reference: placeId,
             },
          });
          return !!existingPlace;
       } catch (err) {
          throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu est survenue`);
 
       }
    }
 
    /**
     * Vérifier si la place par reference existe dans la cache.
     * @param placeReference - Référence du lieu à vérifier.
     * @returns Vrai si le lieu existe, sinon faux.
     * */
    async isPlaceExistsOnCache(placeReference: string): Promise < boolean > {
        try{
            const placeInCache: unknown = await this.cacheService.get(placeReference);
            console.log("placeInCache", placeInCache)
            return !!placeInCache;
        }catch(err){
            throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu est survenue`);
        }
    }

    /**
     * Mise a jour de la cache avec les données de la base de données dans la table Place.
     * @param placeId - Id de la place.
     */
    async updateCacheForNewPlace(placeId: string): Promise<void> {
        try{
            if(!placeId) {
                throw new BadRequestException("L'Id de la place n'est pas définit");
            }
            const place: Place = await this.placeRepository.findOne({
                where: {
                    id: placeId,
                },
            })
            const placeData: string = JSON.stringify(place);
            await this.cacheService.set(placeId, placeData);
        }catch(err){
            if(err instanceof BadRequestException){
                throw err;
            }
            throw new InternalServerErrorException(`Une erreur interne du serveur lors de la mise a jour de lieu est survenue`);
        }
    }

    /**
     * Recherche l'id du  lieu par référence.
     * @param placeReference - Référence du lieu à rechercher.
     * @returns Les informations partielles du lieu ou l'id/
     */
    async findPlaceIdByReferenceOnPlaceDB(placeReference: string): Promise<string> {
       try {
          const place: Place = await this.placeRepository.findOne({
             where: {
                reference: placeReference, // id
             }
          })
 
          if (!place) {
             throw new NotFoundException(`Le lieu que vous cherchez n'a pas été trouvé`);
          }
 
          return place.id;
 
       } catch (err) {
          if (err instanceof NotFoundException) {
             throw err;
          }
          throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu externe avec référence ${placeReference} est survenue`);
       }
    }

    /**
     * Recherche un lieu par référence dans la table APIBackup.
     * @param placeReference - Référence du lieu à rechercher.
     */
    async findPlaceByReferenceOnApiBackupDB(placeReference: string): Promise<APIBackupStore> {
    try{
         const allPlacesDataFromBackupApi: APIBackupStore[] = await this.apiBackupService.fetchDataFromBackupApi();
         const foundPlaceFromBackupApi: APIBackupStore = allPlacesDataFromBackupApi.find(
               (place: APIBackupStore) => placeReference === place.reference,
         );
         if(!foundPlaceFromBackupApi){
               throw new NotFoundException(`O Le lieu que vous cherchez n'a pas été trouvé`);
         }
         return foundPlaceFromBackupApi || null;
    }catch(err){
      if(err instanceof NotFoundException){ 
         throw err; 
      }
      throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu de ApiBackup avec référence ${placeReference} est survenue`);
    }
   }
 
   //  /** 
   //   * Recherche un lieu par référence.
   //   * @param placeReference - Référence du lieu à rechercher.
   //   * @returns Les informations partielles du lieu ou null s'il n'est pas trouvé.
   //   */
   //  async findPlaceByReferenceExternalAPI(
   //     placeReference: string,
   //  ): Promise < AllPlacesType > {
   //     try {
   //        const allPlacesData: AllPlacesType[] = await this.fetchAllPlaces();
   //        const foundPlace: AllPlacesType = allPlacesData.find(
   //           (place: AllPlacesType) => place.reference === placeReference,
   //        );
 
   //        if (!foundPlace) {
   //           throw new NotFoundException(`Le lieu que vous cherchez n'a pas été trouvé`);
   //        }
 
   //        return foundPlace || null;
 
   //     } catch (err) {
   //        if (err instanceof NotFoundException) {
   //           throw err;
   //        }
   //        throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu externe avec référence ${placeReference} est survenue`);
   //     }
   //  }
 
 
    /**
     * Crée un nouveau lieu.
     * @param placeData - Informations partielles du lieu à créer.
     * @returns Le nouveau lieu créé.
     */
    async createPlaceOnDB(placeData: APIBackupStore): Promise<Place>{
       try {
          if (!placeData) {
             throw new BadRequestException(`Les données du lieu sont manquantes`);
          }
          // On récupère le string de la reference, on le sauvegarde dans la base de données.
         //  const newPlace = this.placeRepository.create(placeData);
          const newPlaceBeforeMapped = new Place();
            newPlaceBeforeMapped.reference = placeData.reference;
            newPlaceBeforeMapped.name = placeData.name;
            newPlaceBeforeMapped.localite = placeData.localite;
            newPlaceBeforeMapped.categorieApi = placeData.categorieApi;
            newPlaceBeforeMapped.categorie = placeData.categorie;
            newPlaceBeforeMapped.telephone = placeData.telephone;
            newPlaceBeforeMapped.adresse = placeData.adresse;
            newPlaceBeforeMapped.chargepoint = placeData.chargepoint;
            newPlaceBeforeMapped.geolocalisation = placeData.geolocalisation;

            const newPlace: Place = this.placeRepository.create(newPlaceBeforeMapped);
            return await this.placeRepository.save(newPlace);
       } catch (err) {
          if (err instanceof BadRequestException) {
             throw err;
          }
          throw new InternalServerErrorException(`Lolola, Une erreur interne du serveur lors de la création de lieu est survenue`);
       }
    }
 
    /**
     * Normalise une chaîne de caractères en supprimant les accents, les espaces et en la mettant en minuscules.
     * @param str - Chaîne de caractères à normaliser.
     * @returns Chaîne de caractères normalisée.
     */
    normalizeString(str: string): string {
       return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
          .replace(/\s+/g, '') // Supprime les espaces
          .toLowerCase(); // Met en minuscules
    }
 
 
    /**
     * Effectue une requête HTTP GET à plusieurs APIS externe et renvoie les données JSON résultantes.
     * @param api - L'URL de l'API à interroger.
     * @returns Les données JSON renvoyées par l'API.
     * @throws Une erreur si la requête échoue ou si les données ne sont pas au format JSON.
     */
    async fetchAPI < T > (api: string): Promise < T > {
       try {
          const cachedData: T = await this.cacheService.get(api);
 
          if (cachedData) {
             return cachedData;
          } else {
             const response: Response = await fetch(api);
 
             if (!response.ok) {
                throw new HttpException(`Une erreur HTTP est survenue: ${response.statusText}`, response.status);
             }
 
             // Convertissez la réponse en JSON avant de le mettre en cache
             const responseInJsonSetToCache: T = await response.json();
             await this.cacheService.set(api, responseInJsonSetToCache);
  
             return responseInJsonSetToCache;
 
          }
 
       } catch (err) {
          if (err instanceof HttpException) {
             throw err;
          } else if (err instanceof TypeError) {
             throw new BadGatewayException(`Erreur lors de la connexion à l'API : ${err.message}`);
          }
          throw new InternalServerErrorException(`Une erreur interne du serveur est survenue`);
       }
    }
 
    /**
     * Vérifie si les données reçues sont au bon format, donc le format tableau.
     * @throw On jette une erreur si les données ne sont pas au bon format.
     */
 
    isDataRecievedArray < T > (filteredData: T[]) {
       try {
          if (!Array.isArray(filteredData)) {
             throw new DataFormatError(`Les données reçues ne sont pas au bon format. Elles doivent être un tableau d'objets, mais ont été reçues sous la forme suivante : ${typeof filteredData} : ${filteredData}`);
          };
          return filteredData;
       } catch (err) {
          if (err instanceof DataFormatError) {
             throw err;
          }
       }
    }
 
    /**
     * Vérifie si les bons erreurs pour les fonctions de chaque API.
     * @throw On jette les bons erreurs pour chaque cas des erreurs possibles pour les APIS.
     */
    isAPIError(err: Error): void {
       if (
          err instanceof HttpException ||
          err instanceof BadGatewayException ||
          err instanceof InternalServerErrorException ||
          err instanceof DataFormatError ||
          err instanceof TypeError
       ) {
          throw err;
       }
 
       throw new InternalServerErrorException(
          `Erreur lors de la récupération des données : ${err.message}`
       );
    }
 
    /**
     * Vérifie si les bons erreurs pour les fonctions de chaque API.
     * @throw On jette les bons erreurs pour chaque cas des erreurs possibles pour le Places.controller.
     */
    isControllerPlaceError(err: Error): void {
       if (err instanceof HttpException ||
          err instanceof InternalServerErrorException ||
          err instanceof BadGatewayException ||
          err instanceof DataFormatError ||
          err instanceof TypeError ||
          err instanceof NotFoundException) {
          throw err;
       }
       throw new InternalServerErrorException("Erreur interne du serveur");
    }
 
    /**
     * Effectue une requête à une API externe pour récupérer les données des musées.
     * @returns Un tableau d'objets contenant des informations sur les musées.
     */
    async fetchMuseums(): Promise < FilteredMuseumRecordInterface[] > {
       try {
          const api: string =
             'https://www.odwb.be/api/records/1.0/search/?dataset=adresses-des-musees-reconnus-en-communaute-francaise&q=&facet=categorie&facet=bassin_de_vie_fwb&facet=categorie0';
          const data: MuseumApiResponseInterface = await this.fetchAPI(api);
 
          const filteredData: FilteredMuseumRecordInterface[] = data.records.map((record: MuseumRecordInterface) => ({
             reference: record.recordid,
             name: record.fields.denomination || null,
             localite: record.fields.localite || null,
             categorieApi: record.fields.categorie || null,
             categorie: 'Visite',
             telephone: record.fields.telephone || null,
             adresse: record.fields.adresse || null,
             chargepoint: null,
             geolocalisation: record.fields.geolocalisation || null,
          }));
 
          return this.isDataRecievedArray < FilteredMuseumRecordInterface > (filteredData);
       } catch (err) {
          this.isAPIError(err);
       }
 
    }
 
    /**
     * Effectue une requête à une API externe pour récupérer les données des monuments.
     * @returns Un tableau d'objets contenant des informations sur les monuments.
     */
    // Fonctionne pas: "reference" : "92138-PEX-0002-01"
    async fetchMonuments(): Promise < FilteredMonumentRecordInterface[] > {
       try {
          const api: string = 'https://www.odwb.be/api/explore/v2.1/catalog/datasets/patrimoine-wallon-monuments0/records';
 
          const data: MonumentApiResponseInterface = await this.fetchAPI(api);
 
          const filteredData: FilteredMonumentRecordInterface[] = data.results.map((record: MonumentRecordInterface) => {
             const geoPoint2d = Object.entries(record.geo_point_2d);
             const geoPoint2dArrSimple = geoPoint2d.map((geoPoint2dValues) => geoPoint2dValues[1]);
             return ({
                reference: record.codecarto,
                name: record.libelle || null,
                localite: record.commune || null,
                categorieApi: record.referentie || null,
                categorie: 'Visite',
                telephone: record.telephone || null,
                adresse: record.commune || null,
                chargepoint: null,
                geolocalisation: geoPoint2dArrSimple || null,
             })
          });
 
          return this.isDataRecievedArray < FilteredMonumentRecordInterface > (filteredData);
 
       } catch (err) {
          this.isAPIError(err);
       }
    }
 
 
    /**
     * Effectue une requête à une API externe pour récupérer les données des points de vue.
     * @returns Un tableau d'objets contenant des informations sur les points de vue.
     */
    async fetchPointOfView(): Promise < FilteredPointOfViewApiRecordInterface[] > {
       try {
          const api: string =
             'https://www.odwb.be/api/records/1.0/search/?dataset=points-et-lignes-de-vue-remarquables-en-wallonie1&q=&facet=label&facet=orient&facet=province&facet=arrondissement&facet=canton&facet=commune';
 
          const data: PointOfViewApiResponseInterface = await this.fetchAPI(api);
 
          const filteredData: FilteredPointOfViewApiRecordInterface[] = data.records.map((record: PointOfViewRecordInterface) => ({
             reference: record.recordid,
             name: record.fields.label || null,
             localite: record.fields.commune || null,
             categorieApi: 'Point de vue',
             categorie: 'Visite',
             telephone: record.fields.telephone || null,
             adresse: record.fields.adresse || null,
             chargepoint: null,
             geolocalisation: record.fields.geo_point_2d || null,
          }));
 
          return this.isDataRecievedArray < FilteredPointOfViewApiRecordInterface > (filteredData);
 
       } catch (err) {
          this.isAPIError(err);
       }
 
    }
 
    /**
     * Effectue une requête à une API externe pour récupérer les données des offices de tourisme.
     * @returns Un tableau d'objets contenant des informations sur les offices de tourisme.
     */
    async fetchTouristOffice(): Promise < FilteredTouristOfficeInterface[] > {
       try {
          const api: string =
             'https://www.odwb.be/api/records/1.0/search/?dataset=cgt-pivot-organismes-touristiques&q=';
 
          const data: TouristOfficeApiResponseInterface = await this.fetchAPI(api);
 
          const filteredData: FilteredTouristOfficeInterface[] = data.records.map((record: TouristOfficeInterface) => ({
             reference: record.recordid,
             name: record.fields.nom || null,
             localite: record.fields.adresse1_commune_value || null,
             categorieApi: 'Office de tourisme',
             categorie: 'Information',
             telephone: record.fields.telephone || null,
             adresse: ((record.fields.adresse1_rue || null) +
                ' ' +
                (record.fields.adresse1_organisme_idmdt || null)).trim() || null,
             chargepoint: null,
             geolocalisation: record.fields.geometry?.coordinates || null,
          }));
 
          return this.isDataRecievedArray < FilteredTouristOfficeInterface > (filteredData);
 
       } catch (err) {
          this.isAPIError(err);
       }
    }
 
    /**
     * Effectue une requête à une API externe pour récupérer les données des lieux de divertissement.
     * @returns Un tableau d'objets contenant des informations sur les lieux de divertissement.
     */
    async fetchDivertissement(): Promise < DivertissementApiRecordInterface[] > {
       try {
          const api: string =
             'https://www.odwb.be/api/records/1.0/search/?dataset=cgt-pivot-attractions-et-loisirs&q=&rows=100';
 
          const data: DivertissementApiResponseInterface = await this.fetchAPI(api);
          const categorizedData: DivertissementApiRecordInterface[] = extractCategories(data.records);
 
          return this.isDataRecievedArray < DivertissementApiRecordInterface > (categorizedData);
       } catch (err) {
          this.isAPIError(err);
       }
    }
 
    // Ici fonctionne: "reference" : "737AC6CE-622D-47C8-B429-E2321EC6960F"
    /**
     * Récupère les points de recharge pour les véhicules électriques en Belgique.
     * @returns Un tableau d'objets contenant des informations sur les points de recharge.
     */
    async fetchChargePoints(): Promise < FilteredChargePointsInterface[] > {
       try {
          const apiKey: string = process.env.FETCH_CHARGE_POINTS_KEY;
          const countrycode: string = 'BE';
          const api: string = `https://api.openchargemap.io/v3/poi?key=${apiKey}&countrycode=${countrycode}`;
 
          const data: ChargePointsApiResponseInterface = await this.fetchAPI(api);
 
          const filteredData: FilteredChargePointsInterface[] = data.map((record: ChargePointsInterface) => ({
             reference: record.UUID,
             name: record.OperatorInfo.Title === '(Unknown Operator)' ?
                'Inconnu' : record.OperatorInfo.Title,
             localite: record.AddressInfo.Town ? record.AddressInfo.Town : null,
             categorieApi: 'Borne de recharge',
             categorie: 'Borne de recharge',
             telephone: record.ContactTelephone1 ? record.ContactTelephone1 : null,
             adresse: `${record.AddressInfo.AddressLine1 || ''} ${
           record.AddressInfo.Postcode || ''
         } ${record.AddressInfo.Town || ''} ${
           record.AddressInfo.StateOrProvince || ''
         }`,
             chargepoint: {
                // Type de courant du point de recharge (Courant Alternatif, Triphasé, etc.)
                courant: record.Connections[0] && record.Connections[0].CurrentType ?
                   record.Connections[0].CurrentType.Title : "Pas d'information",
                // Tension du point de recharge (par exemple, "220 V")
                voltage: record.Connections[0] && record.Connections[0].Voltage ?
                   record.Connections[0].Voltage + ' V' : "Pas d'information",
 
                // Puissance du point de recharge (par exemple, "22 KWh")
                puissance: record.Connections[0] && record.Connections[0].PowerKW ?
                   record.Connections[0].PowerKW + ' KWh' : "Pas d'information",
 
                // Ampérage du point de recharge (par exemple, "30 A")
                amperage: record.Connections[0] && record.Connections[0].Amps ?
                   record.Connections[0].Amps + ' A' : "Pas d'information",
 
                // Indique si le point de recharge prend en charge la charge rapide (true ou false)
                chargementRapide: record.Connections[0] && record.Connections[0].Level ?
                   record.Connections[0].Level.IsFastChargeCapable ?
                   true :
                   false : "Pas d'information",
 
                // Nombre de bornes de recharge disponibles à cet emplacement
                nbBorne: record.NumberOfPoints,
             },
             geolocalisation: [
                record.AddressInfo.Latitude,
                record.AddressInfo.Longitude,
             ],
          }));
 
          return this.isDataRecievedArray < FilteredChargePointsInterface > (filteredData);
 
       } catch (err) {
          this.isAPIError(err);
       }
    }
 
 
    /**
     * Récupère toutes les données des lieux à partir des différentes sources.
     * @returns Un tableau d'objets contenant les informations de tous les lieux.
     */
    async fetchAllPlaces(): Promise < AllPlacesType[] > {
       try {
          const museums: FilteredMuseumRecordInterface[] = await this.fetchMuseums();
          const monuments: FilteredMonumentRecordInterface[] = await this.fetchMonuments();
          const pointOfView: FilteredPointOfViewApiRecordInterface[] = await this.fetchPointOfView();
          const touristOffice: FilteredTouristOfficeInterface[] = await this.fetchTouristOffice();
          const divertissement: DivertissementApiRecordInterface[] = await this.fetchDivertissement();
          const chargepoint: FilteredChargePointsInterface[] = await this.fetchChargePoints();
 
          const allPlacesData: AllPlacesType[] = [
             ...museums,
             ...monuments,
             ...pointOfView,
             ...touristOffice,
             ...divertissement,
             ...chargepoint,
          ];
 
          // Si le data n'est pas un tableau, on renvoie une erreur
          if (!Array.isArray(allPlacesData)) {
             throw new DataFormatError(`Les données reçues n'est pas un tableau`);
          }
 
          return allPlacesData;
       } catch (err) {
          this.isAPIError(err);
       }
    }
 }