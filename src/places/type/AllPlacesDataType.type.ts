import { FilteredMuseumRecordInterface } from "../interface/FetchAPIMuseum.interface";
import { FilteredChargePointsInterface } from "../interface/FetchApiChargePonints.interface";
import { DivertissementApiRecordInterface } from "../interface/FetchApiDivertissement.interface";
import { FilteredMonumentRecordInterface } from "../interface/FetchApiMonument.interface";
import { FilteredPointOfViewApiRecordInterface } from "../interface/FetchApiPointOfView.interface";
import { FilteredTouristOfficeInterface } from "../interface/FetchApiTouristOffice.interface";

export type AllPlacesType = 
  FilteredMuseumRecordInterface | 
  FilteredMonumentRecordInterface | 
  FilteredPointOfViewApiRecordInterface | 
  FilteredTouristOfficeInterface | 
  DivertissementApiRecordInterface | 
  FilteredChargePointsInterface;