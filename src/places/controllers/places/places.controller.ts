import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {  Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PlacesService } from 'src/places/services/places/places.service';
import { AllPlacesType } from 'src/places/type/AllPlacesDataType.type';

@Controller('places')
export class PlacesController {
  constructor(private placesService: PlacesService) {}
  // http://localhost:3000/places?category=bornederecharge&subCategory=bornederecharge ! NE PAS EFFACER!
  // http://localhost:3000/places?category=visite&subCategory=visite
  // http://localhost:3000/places?category=visite
  /**
   * Endpoint pour récupérer la liste de tous les lieux, éventuellement filtrée par catégorie et sous-catégorie.
   * @param category - Catégorie principale en tant que chaîne de caractères (facultative).
   * @param subcategory - Sous-catégorie en tant que chaîne de caractères (facultative).
   * @returns Liste des lieux filtrée en fonction des paramètres de requête.
   */
  @UseInterceptors(CacheInterceptor)// Cache automatiquement la réponse pour cet endpoint
  @UseGuards(AuthGuard)
  @Get()
  async getAllPlaces(
    @Query('category') category?: string,
    @Query('subcategory') subcategory?: string,
  ): Promise<AllPlacesType[]> {
    try{
      if (!category) {
        // Si aucune catégorie n'est fournie, renvoie tous les lieux
        try{
          return this.placesService.fetchAllPlaces();
          // return this.placesService.fetchAllPlaces();
        }catch(err){
          this.placesService.isControllerPlaceError(err)
          }
      }
  
      // Normalise la catégorie principale et filtre les lieux en conséquence
      const normalizedMainCategory: string = this.placesService.normalizeString(category);
      let allPlacesData: AllPlacesType[] = await this.placesService.fetchAllPlaces();
  
      if (subcategory) {
        // Si une sous-catégorie est fournie, normalise-la et filtre les lieux en conséquence
        const normalizedSubCategory: string = this.placesService.normalizeString(subcategory);
        allPlacesData = allPlacesData.filter(
          (place: AllPlacesType) =>
            this.placesService.normalizeString(place.categorie) === normalizedMainCategory &&
            this.placesService.normalizeString(place.categorieApi) === normalizedSubCategory,
        );
      } else {
        // Si aucune sous-catégorie n'est fournie, filtre uniquement par catégorie principale
        allPlacesData = allPlacesData.filter(
          (place: AllPlacesType) =>
            this.placesService.normalizeString(place.categorie) === normalizedMainCategory,
        );
      }
      
      // Renvoie la liste des lieux filtrée
      return allPlacesData;
  
    }catch(err){
      this.placesService.isControllerPlaceError(err)
      }
  }
}
