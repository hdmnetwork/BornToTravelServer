export interface MuseumRecordInterface {
    datasetid?: string;
    recordid: string;
    fields: {
      geolocalisation?: [number, number];
      localite?: string;
      code_postal?: number;
      bce?: string;
      bassin_de_vie_fwb?: string;
      categorie: string;
      telephone?: string;
      courriel?: string;
      statut_juridique?: string;
      categorie0?: string;
      denomination?: string;
      province?: string;
      reconnaissance_fwb?: string;
      site_web?: string;
      adresse?: string;
    };
    geometry?: {
      type?: string;
      coordinates?: [number, number];
    };
    record_timestamp?: string;
  }
  
export interface MuseumApiResponseInterface {
    records: MuseumRecordInterface[];
  }

export interface FilteredMuseumRecordInterface { 
    reference: string;
    name?: string | null;
    localite?: string | null;
    categorieApi?: string | null;
    categorie: string;
    telephone?: string | null;
    adresse?: string | null;
    chargepoint?: null;
    geolocalisation?: [number, number] | null;
}