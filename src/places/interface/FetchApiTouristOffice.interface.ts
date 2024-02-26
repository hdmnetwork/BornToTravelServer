export interface TouristOfficeInterface {
    datasetid?: string;
    recordid: string;
    fields: {
        // coordinates
        adresse1_latitude?: number;
        adresse1_localite_value?: string | null;
        datecreation?: string | null;
        codecgt?: string | null;
        userglobalcreation?: string | null;
        categorieApi: string;
        categorie: string;
        telephone?: string | null;
        adresse: string | null;
        typeoffre_label_value?: string | null;
        chargepoint: null;
        geolocalisation?: [number, number] | null;
        nom?: string | null;
        adresse_point_geo?: [number, number] | null;
        typeoffre_idtypeoffre?: string | null; 
        adresse1_longitude?:	number | null;
        adresse1_altitude?: string | null;
        adresse1_commune_value : string | null;
        adresse1_organisme_idmdt? : string | null;
        adresse1_idins?: string | null;
        adresse1_cp?: string | null;
        adresse1_organisme_label? : string | null;
        datemodification? : string | null;
        adresse1_rue?: string | null;
        geometry?:{
            type?: string | null;
            coordinates?:[number, number] | null;
        }
    }
  }

export interface TouristOfficeApiResponseInterface{
    records: TouristOfficeInterface[];
}

export interface FilteredTouristOfficeInterface{
    reference: string;
    name?: string | null;
    localite?: string | null;
    categorieApi: string | null;
    categorie: string;
    telephone?: string | null;
    adresse: string | null;
    chargepoint?: null;
    geolocalisation?: [number, number] | null; // Ici change coordinates
}