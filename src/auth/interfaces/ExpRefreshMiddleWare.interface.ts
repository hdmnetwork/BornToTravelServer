import * as jwt from "jsonwebtoken";

export interface ExpRefreshMiddleWareResponseInterface extends jwt.JwtPayload {
    exp: number;
    id: string;
}