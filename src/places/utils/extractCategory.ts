// import { Place } from 'src/typeorm/entities/Place';
import { swimmingPool, museums } from './keywords';
import { DivertissementApiRecordInterface, DivertissementRecordInterface } from 'src/places/interface/FetchApiDivertissement.interface';

/**
 * Extrait les catégories spécifiques à partir des données fournies.
 * @param data - Les données à analyser et extraire.
 * @returns Un tableau d'objets partiellement remplis avec des catégories extraites.
 */
export const extractCategories = (data: DivertissementRecordInterface[]): DivertissementApiRecordInterface[]=> {
  const categorizedData: DivertissementApiRecordInterface[] = [];

  // Parcourt chaque enregistrement dans les données fournies
  data.forEach((record: DivertissementRecordInterface) => {
    const name: string = record.fields.nom.toLowerCase();
    let category: string = null;

    // Vérifie si le nom de l'enregistrement contient des mots-clés liés aux piscines
    if (swimmingPool.some((keyword) => name.includes(keyword))) {
      category = 'Piscine';
    }
    // Vérifie si le nom de l'enregistrement contient des mots-clés liés aux musées
    else if (museums.some((keyword) => name.includes(keyword))) {
      category = 'Musée';
    }

    // Si une catégorie a été déterminée, ajoute l'enregistrement à la liste des données catégorisées
    if (category) {
      categorizedData.push({
        reference: record.recordid,
        name: name,
        localite: record.fields.adresse1_localite_value || null,
        categorieApi: record.fields.typeoffre_label_value || null,
        categorie: category,
        telephone: record.fields.telephone || null,
        adresse:
          ((record.fields.adresse1_rue || null) +
          ' ' +
          (record.fields.adresse1_organisme_idmdt || null)).trim(),
        chargepoint: null,
        geolocalisation: record.fields.geometry?.coordinates || null,
      });
    }
  });

  return categorizedData;
};