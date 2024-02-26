import * as jwt from 'jsonwebtoken';

export interface RefreshAccessTokenInterface extends jwt.JwtPayload{
    id: string,
}