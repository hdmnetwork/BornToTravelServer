export interface DivertissementRecordInterface {
    datasetid?: string;
    recordid: string;
    fields: {
        categorie: string,
        adresse1_rue?: string;
        codecgt?: string;
        adresse1_cp?: string;
        adresse1_organisme_idmdt?: string;
        adresse1_organisme_label?: string;
        adresse1_commune_value?: string;
        adresse_point_geo?: [number, number];
        adresse1_altitude?: string;
        typeoffre_idtypeoffre?: string;
        adresse1_latitude?: number;
        datecreation?: string;
        userglobalcreation?: string;
        adresse1_localite_value?: string;
        nom: string;
        adresse1_longitude?: number;
        typeoffre_label_value?: string;
        adresse1_idins?: string;
        datemodification?: string;
        telephone?: string;
        geometry?: {
            type?: string;
            coordinates?: [number, number];
        };
    };
}

export interface DivertissementApiResponseInterface {
    records: DivertissementRecordInterface[];
}
export interface DivertissementApiRecordInterface{
    reference: string;
    name: string;
    localite?: string | null;
    categorieApi?: string;
    categorie: string;
    telephone?: string | null;
    adresse?: string | null;
    chargepoint: null;
    geolocalisation?: [number, number] | null;
}