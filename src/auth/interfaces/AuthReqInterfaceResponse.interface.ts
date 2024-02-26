export interface AuthInterfaceResponseInterface {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    pseudo: string;
    isElectricCar: boolean;
}

export interface RefreshTokenPayloadInterface {
    id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    pseudo?: string;
    isElectricCar?: boolean;

}