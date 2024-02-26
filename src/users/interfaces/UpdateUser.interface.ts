import { Request } from 'express';

export interface AuthRequest extends Request{
    user: {
        id: string;
        email: string;
        pseudo: string;
        firstname: string;
        lastname: string;
        isElectricCar: boolean;
    }
}