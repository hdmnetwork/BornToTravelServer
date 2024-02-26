export interface PointOfViewRecordInterface {
    datasetid?: string;
    recordid: string;
    fields: {
        adresse?: string;
        telephone?: string;
        arrondissement?: string;
        label?: string;
        geo_point_2d: [number, number];
        rem?: string;
        orient?: string;
        canton?: string;
        province?: string;
        geo_shape?: GeoShapeInterface;
        ordre?: string;
        commune?: string;
    };
    geometry?: GeometryInterface;
    record_timestamp?: string;
}

interface GeoShapeInterface{
    coordinates?: [[number, number], [number, number], [number, number]]; // Vous pouvez ajuster cela si le nombre de points peut varier
    type?: "LineString";
}

interface GeometryInterface{
    type?: string;
    coordinates?: [number, number];
}

export interface PointOfViewApiResponseInterface {
    records: PointOfViewRecordInterface[];
}

export interface FilteredPointOfViewApiRecordInterface{
    reference: string;
    name?: string | null;
    localite?: string | null;
    categorieApi: string;
    categorie: string;
    telephone?: string | null;
    adresse?: string | null;
    chargepoint?: null;
    geolocalisation?: [number, number] | null;
}