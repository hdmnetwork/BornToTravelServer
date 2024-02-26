export interface ChargePointsInterface {
    ContactTelephone1?:      string;
    DataProvider?:           DataProviderInterface;
    OperatorInfo?:           OperatorInfoInterface;
    UsageType?:              UsageTypeInterface;
    StatusType?:             StatusTypeInterface;
    SubmissionStatus?:       SubmissionStatusInterface;
    UserComments?:           null;
    PercentageSimilarity?:   null;
    MediaItems?:             MediaItemInterface[];
    IsRecentlyVerified?:     boolean;
    DateLastVerified?:       Date;
    ID?:                     number;
    UUID:                    string;
    ParentChargePointID?:    null;
    DataProviderID?:         number;
    DataProvidersReference?: null;
    OperatorID?:             number;
    OperatorsReference?:     null;
    UsageTypeID?:            number;
    UsageCost?:              null;
    AddressInfo?:            AddressInfoInterface;
    Connections:            ConnectionInterface[];
    NumberOfPoints:         number;
    GeneralComments?:        null;
    DatePlanned?:            null;
    DateLastConfirmed?:      null;
    StatusTypeID?:           number;
    DateLastStatusUpdate?:   Date;
    MetadataValues?:         null;
    DataQualityLevel?:       number;
    DateCreated?:            Date;
    SubmissionStatusTypeID?: number;
}

export interface AddressInfoInterface {
    ID?:                number;
    Title?:             string;
    AddressLine1?:      string;
    AddressLine2?:      null;
    Town?:              string;
    StateOrProvince?:   string;
    Postcode?:          string;
    CountryID?:         number;
    Country?:           CountryInterface;
    Latitude?:          number;
    Longitude?:         number;
    ContactTelephone1?: null;
    ContactTelephone2?: null;
    ContactEmail?:      null;
    AccessComments?:    null;
    RelatedURL?:        null;
    Distance?:          null;
    DistanceUnit?:      number;
}

export interface CountryInterface {
    ISOCode?:       string;
    ContinentCode?: string;
    ID?:            number;
    Title?:         string;
}

export interface ConnectionInterface {
    ID:               number;
    ConnectionTypeID?: number;
    ConnectionType?:   ConnectionTypeInterface;
    Reference?:        string;
    StatusTypeID?:     number;
    StatusType?:       StatusTypeInterface;
    LevelID?:          number;
    Level?:            LevelInterface;
    Amps?:             number;
    Voltage?:          number;
    PowerKW?:          number;
    CurrentTypeID?:    number;
    CurrentType?:      CurrentTypeInterface;
    Quantity?:         number;
    Comments?:         null;
}

export interface ConnectionTypeInterface {
    FormalName?:     string;
    IsDiscontinued?: boolean;
    IsObsolete?:     boolean;
    ID?:             number;
    Title?:          string;
}

export interface CurrentTypeInterface {
    Description?: string;
    ID?:          number;
    Title?:       string;
}

export interface LevelInterface {
    Comments?:            string;
    IsFastChargeCapable?: boolean;
    ID?:                  number;
    Title?:               string;
}

export interface StatusTypeInterface {
    IsOperational?:    boolean;
    IsUserSelectable?: boolean;
    ID?:               number;
    Title?:            string;
}

export interface DataProviderInterface {
    WebsiteURL?:             string;
    Comments?:               null;
    DataProviderStatusType?: DataProviderStatusTypeInterface;
    IsRestrictedEdit?:       boolean;
    IsOpenDataLicensed?:     boolean;
    IsApprovedImport?:       boolean;
    License?:                string;
    DateLastImported?:       null;
    ID?:                     number;
    Title?:                  string;
}

export interface DataProviderStatusTypeInterface {
    IsProviderEnabled?: boolean;
    ID?:                number;
    Title?:             string;
}

export interface MediaItemInterface {
    ID?:                 number;
    ChargePointID?:      number;
    ItemURL?:            string;
    ItemThumbnailURL?:   string;
    Comment?:            string;
    IsEnabled?:          boolean;
    IsVideo?:            boolean;
    IsFeaturedItem?:     boolean;
    IsExternalResource?: boolean;
    MetadataValue?:      null;
    User?:               UserInterface;
    DateCreated?:        Date;
}

export interface UserInterface {
    ID?:                          number;
    IdentityProvider?:            null;
    Identifier?:                  null;
    CurrentSessionToken?:         null;
    Username?:                    string;
    Profile?:                     null;
    Location?:                    null;
    WebsiteURL?:                  null;
    ReputationPoints?:            number;
    Permissions?:                 null;
    PermissionsRequested?:        null;
    DateCreated?:                 null;
    DateLastLogin?:               null;
    IsProfilePublic?:             null;
    IsEmergencyChargingProvider?: null;
    IsPublicChargingProvider?:    null;
    Latitude?:                    null;
    Longitude?:                   null;
    EmailAddress?:                null;
    EmailHash?:                   null;
    ProfileImageURL?:             string;
    IsCurrentSessionTokenValid?:  null;
    APIKey?:                      null;
    SyncedSettings?:              null;
}

export interface OperatorInfoInterface {
    WebsiteURL?:            string;
    Comments?:              null;
    PhonePrimaryContact?:   null;
    PhoneSecondaryContact?: null;
    IsPrivateIndividual?:   boolean;
    AddressInfo?:           null;
    BookingURL?:            null;
    ContactEmail?:          string;
    FaultReportEmail?:      null;
    IsRestrictedEdit?:      boolean;
    ID?:                    number;
    Title?:                 string;
}

export interface SubmissionStatusInterface {
    IsLive?: boolean;
    ID?:     number;
    Title?:  string;
}

export interface UsageTypeInterface {
    IsPayAtLocation?:      null;
    IsMembershipRequired?: null;
    IsAccessKeyRequired?:  null;
    ID?:                   number;
    Title?:                string;
}

export type ChargePointsApiResponseInterface = ChargePointsInterface[];

export interface FilteredChargePointsInterface{
    reference: string;
    name: string;
    localite?: string;
    categorieApi: string;
    categorie: string;
    telephone?: any;
    adresse: string;
    chargepoint: {
        courant: string;
        voltage: string;
        puissance: string;
        amperage: string;
        chargementRapide: string | boolean;
        nbBorne: number;
    };
    geolocalisation: number[];
}