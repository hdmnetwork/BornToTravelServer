import { Request } from 'express';

export interface AuthRequest extends Request{
    user: {
        id: number;
        email: string;
        firstname: string;
        lastname: string;
        pseudo: string;
        isElectricCar: boolean;
    }
}