// Interface
export interface MonumentRecordInterface {
    results: string | null;
    telephone: string | null;
    geo_point_2d?: [number, number];
    geo_shape?: {
        type?: string;
        geometry?: {
            coordinates?: [[number, number]];
            type: string;
        }
        properties?: {}
    };
    codecarto?: string;
    libelle?: string;
    histo?: string;
    liendoc?: string;
    datearrete?: string;
    referentie?: string;
    province?: string;
    arrondissement?: string;
    canton?: string;
    commune?: string;
  }

export interface MonumentApiResponseInterface{
    results: MonumentRecordInterface[];
}

export interface FilteredMonumentRecordInterface { 
    reference: string;
    name?: string | null;
    localite?: string | null;
    categorieApi?: string | null;   // DATAS APRES TRI PAR NOUS
    categorie: string;
    telephone?: string | null;
    adresse?: string | null;
    chargepoint?: null;
    geolocalisation?:number[] | null;
}
