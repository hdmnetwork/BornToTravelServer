import * as jwt from 'jsonwebtoken';
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { ExpRefreshMiddleWareResponseInterface } from '../interfaces/ExpRefreshMiddleWare.interface';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';

@Injectable()
export class RefreshMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  /**
   * Middleware qui gère le rafraîchissement automatique des tokens d'accès.
   * @param req - Objet Request d'Express.
   * @param res - Objet Response d'Express.
   * @param next - Fonction pour passer au prochain middleware.
   */
  async use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>  {
    // Récupère le token d'accès à partir de l'en-tête de la requête
    const accessToken: string | jwt.JwtPayload = req.headers.authorization?.split(' ')[1];

    // Vérifie si un token d'accès est présent dans l'en-tête de la requête
    if (accessToken) {
      try {
        // Décodage du token d'accès pour obtenir les informations utilisateur
        const decoded: string | jwt.JwtPayload = this.authService.decodeAccessToken(accessToken);

        // decodeAccessToken peut retourner une chaîne ou un objet jwt.JwtPayload.
        // Nous devons vérifier et assurer que nous avons un objet avec les champs nécessaires dans le middleware.
        if(typeof decoded === "string" || !("exp" in decoded) || !("id" in decoded)){
          throw new BadRequestException("Le token payload n'est pas valide");
        }
        // Si le token est valide et comporte exp du type number et id du type string, on peut caster decoded en ExpRefreshMiddleWareResponseInterface en utilisant une assertion de type
        const decodedToken: ExpRefreshMiddleWareResponseInterface = decoded as ExpRefreshMiddleWareResponseInterface;

        // Calcul de la date d'expiration du token
        const expirationTime: number = decodedToken.exp * 1000;
        const currentTime: number = Date.now();
        const timeToExpiration: number = expirationTime - currentTime;
        const timeRemaining: number = timeToExpiration / 1000;

        // Vérifie si le temps restant est inférieur à 24 minutes (en secondes)
        if (timeRemaining < 24 * 60) {
        // if (timeRemaining < 30) {
          const userId: string = decodedToken.id;

          // Récupère le token de rafraîchissement associé à l'utilisateur
          const storedRefreshToken: RefreshToken = await this.authService.getRefreshTokenByUserId(userId);

          if (storedRefreshToken) {
            // Vérifie si le token de rafraîchissement a expiré
            const isExpired: boolean = await this.authService.isRefreshTokenExpired(storedRefreshToken.refreshToken);

            if (isExpired) {
              // Supprime le token de rafraîchissement expiré et renvoie une réponse non autorisée
              await this.authService.deleteRefreshTokenByUserId(userId);
              return res
                .status(401)
                .json({
                  message: 'Votre session a expiré. Veuillez vous reconnecter.',
                });
            }

            // Génère un nouveau token d'accès à partir du token de rafraîchissement
            const newAccessToken: string = await this.authService.refreshAccessToken(storedRefreshToken.refreshToken);

            // Met à jour l'en-tête de la réponse avec le nouveau token d'accès
            res.setHeader('Authorization', `Bearer ${newAccessToken}`);
          }
        }
      } catch (error) {
        // En cas d'erreur de décodage ou de toute autre erreur, renvoie une réponse non autorisée
        return res
          .status(401)
          .json({
            message: "Vous n'êtes pas connecté. Veuillez vous connecter.",
          });
      }
    }

    // Passe au prochain middleware
    next();
  }
}
