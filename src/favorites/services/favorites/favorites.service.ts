//favorites.services.ts

import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AllPlacesType } from 'src/places/type/AllPlacesDataType.type';
import { FavoritePlace } from 'src/typeorm/entities/FavoritePlace';
import { Place } from 'src/typeorm/entities/Place';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache} from 'cache-manager';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoritePlace)
    private favoritePlaceRepository: Repository<FavoritePlace>,
    @InjectRepository(Place)
    private placeRepository: Repository<Place>, // Assurez-vous que l'injection est correcte
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {}


  /**
   * Ajoute un lieu aux favoris de l'utilisateur s'il n'existe pas déjà dans ses favoris.
   * @param userId - ID de l'utilisateur auquel ajouter le lieu aux favoris.
   * @param placeId - ID du lieu à ajouter aux favoris.
   */
  async addFavoriteToFavoriteDB(userId: string, placeId: string): Promise<void> {
    try{
    // Vérifie si l'association existe déjà dans la base de données.
    if(!userId || !placeId) {
      throw new BadRequestException("userId or placeId ne sont pas définit");
    }

    // Vérifie si l'association existe déjà dans la base de données.
    const existingAssociation: FavoritePlace = await this.favoritePlaceRepository.findOne({
      where: { user: { id: userId }, place: { id: placeId } },
      relations: ['place'],
    });

    if (!existingAssociation) {
      // Si l'association n'existe pas, crée une nouvelle entrée dans la table de favoris.
      const favoritePlace: FavoritePlace = this.favoritePlaceRepository.create({
        user: { id: userId },
        place: { id: placeId },
      });

      await this.favoritePlaceRepository.save(favoritePlace);
    }
    }catch(err){
      if(err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur interne du serveur s'est produite lors de l'ajoute au favorit. Veuillez réessayer plus tard.`);
    }
  }

      /**
     * Mise a jour de la cache avec les données de la base de données dans la table favorite_place.
     * @param placeId - Id de la place.
     */
      async updateCacheForNewFavoritePlace(userId: string, placeId: string) {
        try{
          console.log("je call ma méthode pour mettre a jour le cache favoris")
          const favoriteKey: string = `Favorite:${userId}:${placeId}`;
        const existingAssociation: FavoritePlace = await this.favoritePlaceRepository.findOne({
          where: { user: { id: userId }, place: { id: placeId } },
          relations: ['place'],
        });

        if(!existingAssociation){
          return false;
        }else{
          const favoriteData: string = JSON.stringify(existingAssociation);
          await this.cacheService.set(favoriteKey, favoriteData);
       }
        }catch(err) {
           if(err instanceof BadRequestException){
               throw err;
           }
           throw new InternalServerErrorException(`Une erreur interne du serveur lors de la mise a jour de lieu en favoris est survenue`);
        }
      }

  /**
     * Crée un nouveau lieu à favoris.
     * @param placeData - Informations partielles du lieu à créer.
     * @returns Le nouveau lieu créé.
   */
  async findPlaceInFavoriteByPlaceIdOnPlaceDB(placeId: string): Promise<Place>{
    try{
      console.log("J'add un favoris")
      const existingPlace = await this.placeRepository.findOne({
        where: {
            id: placeId ,
           },
      });

      if(!existingPlace){
        throw new NotFoundException(`Aucun lieu n'as été trouvé pour cet utilisateur`);
      }

      return existingPlace;
		}catch(err){
      if(err instanceof NotFoundException){
        throw err;
      }
			throw new InternalServerErrorException(`Une erreur interne du serveur lors de la récuperation de lieu est survenue`);
		}

  }

  /**
   * Retourne toutes les informations concernant les lieux favoris d'un utilisateur.
   * @param id - ID de l'utilisateur dont les lieux favoris doivent être récupérés.
   * @returns Un tableau contenant toutes les informations des lieux favoris de l'utilisateur.
  */
  async getAllFavoritePlacesByUser(id: string) {
    try{
      const allFavoritesPlaces = await this.favoritePlaceRepository.find({
        where: { user: { id } },
        relations: ['place'],
      });

      if(allFavoritesPlaces.length === 0){
        console.log('Aucuns favoris -> Renvoyer un tableau vide !!');
        return [];
      }
      return allFavoritesPlaces;
    }catch(err) {
      if(err instanceof NotFoundException){
        throw err;
      }
      throw new InternalServerErrorException(`Erreur au moment de la récuperation de places: ${err}`);
    }
  }

  /**
     * Vérifie si un lieu spécifié par sa référence est déjà enregistré comme favori par un utilisateur donné.
     * Cette méthode recherche dans la table `favorite_place` pour trouver une entrée correspondant à la fois
     * à l'ID de l'utilisateur et à la référence du lieu. Elle est utilisée pour éviter les doublons de lieux
     * dans la liste des favoris d'un utilisateur.
     *
     * @param userId - L'identifiant de l'utilisateur.
     * @param referencePlace - La référence unique du lieu à vérifier.
     * @returns Un booléen indiquant si le lieu est déjà dans les favoris de l'utilisateur (true) ou non (false).
  */
	async findPlaceInFavoriteByPlaceIdAndUserIdInDBFavorite(userId: string, placeId: string): Promise<boolean> {
		try{
      // Vérifie si le lieu existe déjà dans la base de données par référence et par l'id de cet utilisateur.
      const existingPlace: FavoritePlace = await this.favoritePlaceRepository.findOne({
        where: {
          user: { id: userId },
          place: { reference: placeId },
        },
        relations: ['place'],
      });
      return !!existingPlace;
		}catch(err){
			throw new InternalServerErrorException(`une erreur interne du serveur lors de la récuperation de lieu est survenue`);
		}
	}

  /**
   * Vérifie si un lieu spécifié par sa référence est déjà enregistré comme favori par un utilisateur donné dans le cache.
   */
  async getPlaceFromCache(userId: string, referencePlace: string){

  }

  /**
   * Met à jour le cache avec les informations d'un lieu trouvé dans l'API externe.
   */
  async updateCache(referencePlace: string, foundPlaceExternalAPI: AllPlacesType){
  }

  /**
 * Retourne la place favorite d'un utilisateur supprimée de ses favoris.
 * @param id - ID du lieu à supprimer des favoris.
 * @param userId - ID de l'utilisateur dont le lieu doit être supprimé des favoris.
 * @returns - Retourner le lieu supprimé des favoris.
 */
  async deletePlaceFromFavorites(id: string, userId: string): Promise<{ message: string }> {
    try {
      console.log("Attempting to delete place with ID:", id, "for user ID:", userId);
  
      // Check if the association exists
      const existingAssociation: FavoritePlace = await this.favoritePlaceRepository.findOne({
        where: { user: { id: userId }, place: { id } },
      });
  
      console.log("Existing Association:", existingAssociation);
  
      if (!existingAssociation) {
        console.log("Association not found. Cannot delete.");
        throw new ConflictException(`Vous ne pouvez pas supprimer ce lieu`);
      }
  
      console.log("Association found. Deleting...");
  
      // Remove the association
      await this.favoritePlaceRepository.remove(existingAssociation);
  
      console.log("Association deleted successfully.");
  
      // Check if there are any remaining associations for the place
      const remainingAssociation: FavoritePlace[] = await this.favoritePlaceRepository.find({
        where: { place: { id } },
      });
  
      console.log("Remaining Associations:", remainingAssociation);
  
      if (remainingAssociation.length === 0) {
        console.log("No remaining associations. Deleting place...");
  
        // Remove the place if no remaining associations
        await this.placeRepository.delete(id);
  
        console.log("Place deleted successfully.");
      } else {
        console.log("Remaining associations found. Not deleting place.");
      }
  
      return { message: 'Place supprimée des favoris' };
    } catch (err) {
      console.error("Error during place deletion:", err);
  
      if (err instanceof ConflictException || err instanceof UnauthorizedException) {
        throw err;
      }
  
      throw new InternalServerErrorException(`Erreur serveur au moment de la suppression: ${err}`);
    }
  }
  
}