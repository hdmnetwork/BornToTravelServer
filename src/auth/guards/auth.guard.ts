import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { SecretAuthGuardsResponseInterface } from '../interfaces/SecretAuthGuardsResponse.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * Méthode d'activation du AuthGuard.
   * @param context - Contexte d'exécution de la requête.
   * @returns Vrai si l'utilisateur est authentifié, sinon lance une exception UnauthorizedException.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupère l'objet Request d'Express depuis le contexte
    /*
    * A voir avec Stephen pour le type de request
    */
    const request: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> = context.switchToHttp().getRequest();

    // Extrait le token d'accès de l'en-tête de la requête
    const token: string = this.extractTokenFromHeader(request);

    if (!token) {
      // Si aucun token n'est présent, lance une exception UnauthorizedException
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à accéder à cette page",
      );
    }

    try {
      // Vérifie et décode le token d'accès à l'aide du service JwtService
      const payload: SecretAuthGuardsResponseInterface = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      // Stocke les informations utilisateur décodées dans l'objet Request
      request['user'] = payload;
    } catch {
      // En cas d'erreur lors de la vérification du token, lance une exception UnauthorizedException
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à accéder à cette page",
      );
    }
    
    // Si l'authentification est réussie, renvoie true pour autoriser l'accès
    return true;
  }

  /**
   * Extrait le token d'accès de l'en-tête de la requête.
   * @param request - Objet Request d'Express.
   * @returns Token d'accès ou undefined s'il n'est pas présent.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type = "", token = ""]: string[] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
