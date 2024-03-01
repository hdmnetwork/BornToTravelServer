//favorites.controller.ts

import {
  CacheInterceptor,
  CacheKey,
  CacheTTL
} from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  AuthGuard
} from 'src/auth/guards/auth.guard';
import {
  RefreshMiddleware
} from 'src/auth/middlewares/refresh.middleware';
import {
  AuthRequest
} from 'src/favorites/interface/AuthReqInterfaceResponse.interface';
import {
  FavoritesService
} from 'src/favorites/services/favorites/favorites.service';
import {
  PlacesService
} from 'src/places/services/places/places.service';
import {
  AllPlacesType
} from 'src/places/type/AllPlacesDataType.type';
import { APIBackupStore } from 'src/typeorm/entities/APIBackupStore';
import {
  FavoritePlace
} from 'src/typeorm/entities/FavoritePlace';
import {
  Place
} from 'src/typeorm/entities/Place';
import { instanceToPlain } from 'class-transformer';


@Controller('favorites')
export class FavoritesController {
  constructor(
      private favoritesService: FavoritesService,
      private placesService: PlacesService,
  ) {}


  /**
   * ° Mettre en place une méthode qui popule notre propre db et l'apeller en mode devellopement uniquement.
  Cette méthode populera notre db avec les diverses api requises et les stockera.

  *° Redis renvoie tous les lieux existants en db au lieu de renvoyer uniquement les lieux existants dans
  le cache avec lesquels, l'utilisateur a une relation !
   */

  /**
   * Ajoute un lieu aux favoris d'un utilisateur.
   * Si le lieu n'existe pas dans la base de données, il est d'abord recherché dans une source externe (API).
   * Si le lieu est trouvé dans la source externe, il est enregistré dans la base de données avant d'être ajouté aux favoris.
   * @param placeData - Données du lieu à ajouter aux favoris, y compris la référence du lieu.
   * @param req - Objet Request contenant les informations de l'utilisateur authentifié.
   * @returns Un message de confirmation ou une erreur en cas d'échec.
   */
  @UseGuards(AuthGuard)
  @Post('add')
  async addToFavorites(
      @Body() placeData: {
          reference: string,
      },
      @Req() req: AuthRequest,
  ): Promise < void > {
      const userId: string = req.user.id;
      try {
          // Vérifie si le lieu existe déjà dans la base de données par userId pour voir si l'utilisateur connecté a déjà ajouté ce lieu en favoris.
          const placeExistsInFavoritesInBDD: boolean = await this.favoritesService.findPlaceInFavoriteByPlaceIdAndUserIdInDBFavorite(userId, placeData.reference);

          if (placeExistsInFavoritesInBDD) {
              throw new BadRequestException(`Le lieu existe déjà dans vos favoris`);
          } else {

              // Ensuite, vérifiez si les détails de la place sont dans le cache Redis.
              const placeExistsInCache = await this.placesService.isPlaceExistsOnCache(placeData.reference);

              // Vérifie si le lieu existe déjà dans la base de données par référence.
              const placeExistsByReferenceInBDD: boolean = await this.placesService.isPlaceExistsByReferenceOnBDDPlace(
                  placeData.reference,
              );

              // Si le lieu existe dans la base de données Place ni dans le cache, recherchez-le dans la table APIBackup. A reflechir!
              // const foundPlaceApiBackup = await this.placesService.findPlaceByReferenceOnApiBackupDB(placeData.reference);

              const foundPlaceInternalBackupAPI: APIBackupStore = await this.placesService.findPlaceByReferenceOnApiBackupDB(placeData.reference);

              // Si le lieu n'existe pas dans le cache ni dans la base de données Place ni dans APIBackup, recherchez-le dans une source externe (API) par sa référence.
              // const foundPlaceExternalAPI: AllPlacesType = await this.placesService.findPlaceByReferenceExternalAPI(
              //     placeData.reference,
              // );

              // Si le lieu (cherché par reference) n'existe pas dans la base de données ni dans la cache, enregistrez-le dans la base de données.
              if (!placeExistsByReferenceInBDD || placeExistsInCache) {
                  // const savedPlace: Place = await this.placesService.createPlaceOnDB(foundPlaceExternalAPI);
                  const savedPlace = await this.placesService.createPlaceOnDB(foundPlaceInternalBackupAPI);
                  await this.placesService.updateCacheForNewPlace(savedPlace.id);
                  await this.favoritesService.addFavoriteToFavoriteDB(userId, savedPlace.id);
                  await this.favoritesService.updateCacheForNewFavoritePlace(userId, savedPlace.id);
              } else {
                  const placeIdFound = await this.placesService.findPlaceIdByReferenceOnPlaceDB(placeData.reference);
                  const findPlaceId = await this.favoritesService.findPlaceInFavoriteByPlaceIdOnPlaceDB(placeIdFound);

                  // Si le lieu existe déjà dans la base de données et dans la cache, ajoutez-le simplement aux favoris.

                  await this.placesService.isPlaceExistsOnCache(placeData.reference);
                  await this.favoritesService.addFavoriteToFavoriteDB(userId, findPlaceId.id);
                  await this.favoritesService.addFavoriteToFavoriteDB(userId, findPlaceId.id); 
              }
          }

      } catch (err) {
          if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException) {
              throw err;
          }
          throw new InternalServerErrorException(`addToFavorites, Une erreur interne du serveur s'est produite. Veuillez réessayer plus tard.`);
      }
  }

  /**
   * Récupère tous les lieux ajoutés en favoris par un utilisateur.
   * @param req - Objet Request contenant les informations de l'utilisateur authentifié.
   * @returns Les listes des lieux ajoutés en favoris par l'utilisateur.
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard, RefreshMiddleware)
  @Get("showFavorites/:id")
  async getAllFavoriteByUser(@Param("id", ParseUUIDPipe) id: string, ) {
      try {
        console.log("");

        const favorites = await this.favoritesService.getAllFavoritePlacesByUser(id);
        return instanceToPlain(favorites, {
          //excludePrefixes: ['id'],
        });
      } catch (err) {
          if (err instanceof NotFoundException) {
              throw err;
          };
          throw new InternalServerErrorException(`Erreur serveur interne: ${err}`);
      }
  }

  /**
   * Supprime un lieu des favoris d'un utilisateur.
   * @param id - Identifiant du lieu à supprimer des favoris.
   * @param req - Objet Request contenant les informations de l'utilisateur authentifié.
   * @returns Un message de confirmation ou une erreur en cas d'échec.
   */
  @UseGuards(AuthGuard, RefreshMiddleware)
@Delete('delete/:placeId')
async deletePlaceFromFavorites(
  @Param("placeId", ParseUUIDPipe) id: string,
  @Req() req: AuthRequest,
): Promise<{ message: string }> {
  try {
    console.log('Deleting place with ID:', id);
    console.log("je log le req.user", req.user.id)
    return await this.favoritesService.deletePlaceFromFavorites(id, req.user.id);
  } catch (err) {
    if (err instanceof ConflictException || err instanceof UnauthorizedException) {
      throw err;
    }
    throw new InternalServerErrorException(`Erreur serveur interne: ${err}`);
  }
}
}
