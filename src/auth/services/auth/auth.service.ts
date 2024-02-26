import * as jwt from 'jsonwebtoken';

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { decodePassword } from 'src/utils/bcrypt';
import { jwtConstants } from 'src/auth/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { DeleteResult, EntityNotFoundError, Repository } from 'typeorm';
import { createRefreshTokenDto } from 'src/auth/dtos/tokenPayload.dto';
import * as nodemailer from 'nodemailer';
import { DateTime } from "luxon"
import { User } from 'src/typeorm/entities/User';
import { ConfigService } from '@nestjs/config';
import { TokenAuthResponseInterface } from 'src/auth/interfaces/TokenAuthResponse.interface';
import { AuthInterfaceResponseInterface, RefreshTokenPayloadInterface } from 'src/auth/interfaces/AuthReqInterfaceResponse.interface';
import { RandomCodeResponseInterface } from 'src/auth/interfaces/RandomCodeResponse.interface';
import { SendMailResponseInterface } from 'src/auth/interfaces/SendMailResponse.interface';
import { RefreshAccessTokenInterface } from 'src/auth/interfaces/RefreshAccessToken.interface';
import { ExpRefreshMiddleWareResponseInterface } from 'src/auth/interfaces/ExpRefreshMiddleWare.interface';
import { ValidationService } from 'src/utils/ValidationService';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService,
    private validationService: ValidationService,

  ) {}

  /**
   * Connexion de l'utilisateur et génération de tokens d'accès et de rafraîchissement.
   * @param email - Email de l'utilisateur.
   * @param pass - Mot de passe de l'utilisateur.
   * @returns Tokens d'accès et de rafraîchissement.
   * @throws UnauthorizedException si les identifiants de connexion sont invalides.
   */
  async signIn(email: string, pass: string): Promise<TokenAuthResponseInterface> {
    try{

      const user: Partial<User> = await this.usersService.findUserByEmail(email);
      if (!user || !this.validationService.isEmailValid(email)) {
        throw new BadRequestException("Email invalide");
      }

      if (!decodePassword(pass, user.password)) {
        throw new BadRequestException('Mot de passe invalides');
      }
  
      try{
        // Supprime le code de réinitialisation de l'utilisateur dans la table users
        await this.usersService.resetResetPasswordFields(email);
      }catch(err) {
        if(err instanceof InternalServerErrorException){
          throw err;
        }
      }
  
      try{
          // Ajout des information utilisateur dans le token d'accès
          const tokenPayload: AuthInterfaceResponseInterface = {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            pseudo: user.pseudo,
            isElectricCar: user.isElectricCar,
          };
          const existingRefreshToken: RefreshToken = await this.getRefreshTokenByUserId(user.id.toString());
          let refreshToken: string;
  
          //Si le token de rafraichissement existe, on le renouvelle
          if (existingRefreshToken) {
            try{
              refreshToken = this.generateRefreshToken(tokenPayload);
              await this.updateRefreshToken(existingRefreshToken, refreshToken);
            }catch(err){
              if(err instanceof InternalServerErrorException || err instanceof BadRequestException){
                throw err;
              }
              throw new InternalServerErrorException(`Erreur lors de la génération du token de rafraîchissement ${err.message}`)
            }
          } else {
            try{
              //Si non, on en ajoute un nouveau token de rafraichissement dans le cas ou le token de refraichissement n'existe pas, pour se connecter
              refreshToken = this.generateRefreshToken(tokenPayload);
              await this.saveRefreshToken(user.id, refreshToken);
            }catch(err){
              if(err instanceof BadRequestException || err instanceof InternalServerErrorException || err instanceof EntityNotFoundError || err instanceof NotFoundException){
                throw err;
              }
            }
          }
  
          try{
            // accessToken est le token d'accès généré par jwt sign avec le payload tokenPayload et la clé secrète jwtConstants.secret
            const accessToken: string = await this.jwtService.signAsync(tokenPayload);
            return {
              access_token: accessToken,
              refresh_token: refreshToken,
            };
          }catch(error){
            throw new InternalServerErrorException(`Erreur lors de la génération du token d'accès ${error.message}`)
          }
        }catch(err){
          if(err instanceof InternalServerErrorException || err instanceof UnauthorizedException){
            throw err;
          }else{
            throw new InternalServerErrorException(`Une erreur est survenue lors de la connexion ${err.message}`)
          }
        }  
    }catch(err){
      if(err instanceof BadRequestException){
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur est survenue lors de la connexion: ${err.message}`)
    }
  }

  /**
   * Cherche un utilisateur par son userID dans la table RefreshToken et renvoie ses informations.
   * @param userId - ID de l'utilisateur.
   * @returns Token de rafraîchissement de l'utilisateur.
   * @throws NotFoundException si le token de rafraîchissement n'est pas trouvé.
   * @throws InternalServerErrorException si il y a un problem server.
  */
    // async getUserByRefreshTokenUserId(userId: number){
    async getUserByRefreshTokenUserId(userId: string){
      try{
        return await this.refreshTokenRepository.findOne({
          where: { userId },
        });
      }catch(err){
        throw new InternalServerErrorException(`Erreur du serveur, impossible de récupérer le token de rafraîchissement: ${err.message}`);
      }
    }

    /**
   * Supprime le token de rafraîchissement d'un utilisateur.
   * @param userId - ID de l'utilisateur.
   * @returns Résultat de la suppression du token de rafraîchissement.
   * @throws NotFoundException si le token de rafraîchissement n'est pas trouvé.
   * @throws BadRequestException si la suppression du token de rafraîchissement échoue.
   */
    async deleteRefreshTokenByUserId(idUser: string): Promise<DeleteResult> {
      try {
        const userId = idUser;
        if(userId === undefined || userId === null) {
          throw new BadRequestException("L'id de l'utilisateur est invalide")
        }
        const refreshToken: RefreshToken = await this.getUserByRefreshTokenUserId(userId);
        if(!refreshToken){
          throw new NotFoundException("Token de rafraîchissement introuvable");
        }
        const result: DeleteResult = await this.refreshTokenRepository.delete(refreshToken.id);
  
        if (!result.affected) {
          throw new InternalServerErrorException(
            `Token de rafraîchissement avec l'ID d'utilisateur ${userId} impossible à supprimer, un échec est survenu lors de la suppression!`,
          );
        }
        return result;
      } catch (err) {
        if(err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException){
          throw err;
        }
        throw new InternalServerErrorException(
          `Erreur de serveur, impossible de supprimer le token de rafraîchissement: ${err.message}`,
        );
      }
    }

     /**
     * Génère un code aléatoire à 4 chiffres et renvoie également une date d'expiration de 5 minutes.
     * @returns Objet contenant le code généré et la date d'expiration.
     */
    generateRandomCode(): RandomCodeResponseInterface { // Sur controller ligne 82 RandomCodeResponseInterface
      const min: number = 1000;
      const max: number = 9999;
      const code: number = Math.floor(Math.random() * (max - min + 1)) + min;
    
      const expirationDate: Date = DateTime.local().plus({second: 300}).toJSDate();
    
      return { code: code.toString(), expirationDate };
    }

    /**
     * Envoie un e-mail de réinitialisation de mot de passe.
     * @param email - L'adresse e-mail de l'utilisateur.
     * @param randomCode - Le code de réinitialisation généré.
     * @returns Une promesse résolue à `true` si l'e-mail est envoyé avec succès, sinon `false`.
     */

    async sendEmailForgotPassword(
      email: string,
      randomCode: string,
    ): Promise<boolean> {
      try {
        const resetCode: string = randomCode;

        const host: string = this.configService.get<string>('MAIL_HOST');
        const smtpTransport: nodemailer.Transporter = nodemailer.createTransport({
          host: host,
          port: 465,
          secure: true,
          auth: {
            user: this.configService.get<string>("ADMIN_MAIL_SENDER"),
            pass: this.configService.get<string>("ADMIN_PASSWORD_SENDER")
          },
        });

        const mail: SendMailResponseInterface = {
          from: `"BornToTravel" ${this.configService.get<string>("ADMIN_MAIL_SENDER")}`,
          to: email,
          subject: 'Réinitialisation de votre mot de passe',
          text: 'Vous avez demandé la réinitialisation de votre mot de passe.',
          html: `Bonjour,<br><br>Vous avez demandé la réinitialisation de votre mot de passe.<br><br>Voici le code :<br><br>${resetCode}`,
        };

        if(!await smtpTransport.sendMail(mail)){
          throw new BadRequestException("Erreur lors de l'envoi de l'e-mail");
        }
        return true;
      } catch (error) {
        throw new InternalServerErrorException(`Erreur du serveur, impossible d'enoyer l'e-mail: ${error.message}`);
      }
    }

  /**
   * Vérifie si le code de réinitialisation est valide et non expirée.
   * @param token - Le token de réinitialisation à vérifier.
   * @returns Une promesse résolue à l'utilisateur si le token est valide, sinon `null`.
   */
  async verifyResetToken(token: string): Promise<User | null> {
    try{
      const user: User = await this.usersService.findUserByResetPasswordToken(token);

      if (
        user &&
        user.resetTokenExpiration &&
        DateTime.local().toJSDate() < user.resetTokenExpiration
      ) {
        return user;
      }else{
        if(DateTime.local().toJSDate() > user.resetTokenExpiration){
          throw new BadRequestException("Le token de réinitialisation est expiré");
        }
      }
    }catch(err) {
      if(err instanceof BadRequestException || err instanceof EntityNotFoundError || err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException(`Erreur du serveur, impossible de vérifier le token: ${err.message}`);
    }
  }

  /**
   * Génère un token de rafraîchissement.
   * @param createRefreshTokenDto - Données pour la création du token de rafraîchissement.
   * @returns Token de rafraîchissement généré.
   */
  generateRefreshToken(tokenPayload: createRefreshTokenDto): string {
    const payload: RefreshTokenPayloadInterface = {
      id: tokenPayload.id,
      email: tokenPayload.email,
    };
    const refreshToken: string = jwt.sign(payload, jwtConstants.refreshSecret, {
      expiresIn: jwtConstants.refreshExpiration,
    });

    return refreshToken;
  }

  /**
   * Met à jour un token de rafraîchissement existant.
   * @param refreshTokenObj - Objet du token de rafraîchissement à mettre à jour.
   * @param newRefreshToken - Nouveau token de rafraîchissement généré.
   * @throws BadRequestException si la mise à jour du token de rafraîchissement échoue.
   */
  async updateRefreshToken(
    refreshTokenObj: RefreshToken,
    newRefreshToken: string,
  ): Promise<void> {
    try {
      refreshTokenObj.refreshToken = newRefreshToken;
      await this.refreshTokenRepository.save(refreshTokenObj);
    } catch (error) {
      throw new InternalServerErrorException(
        'Impossible de mettre à jour le Token de rafraîchissement',
      );
    }
  }

  /**
   * Enregistre un nouveau token de rafraîchissement.
   * @param userId - ID de l'utilisateur.
   * @param refreshToken - Token de rafraîchissement à enregistrer.
   * @throws BadRequestException si l'enregistrement du token de rafraîchissement échoue.
   */
  async saveRefreshToken(userId: string, refreshToken: string): Promise<RefreshToken> {
  // async saveRefreshToken(userId: number, refreshToken: string): Promise<RefreshToken> {
    try {
      const newRefreshToken: RefreshToken = this.refreshTokenRepository.create({
        userId,
        refreshToken,
      });
      return await this.refreshTokenRepository.save(newRefreshToken);
    } catch (error) {
      throw new InternalServerErrorException(
        'Impossible de créer le Token de rafraîchissement',
      );
    }
  }

  /**
   * Récupère le token de rafraîchissement associé à un utilisateur.
   * @param userId - ID de l'utilisateur.
   * @returns Token de rafraîchissement associé à l'utilisateur ou undefined s'il n'existe pas.
   * @throws BadRequestException si la récupération du token de rafraîchissement échoue.
   */
  async getRefreshTokenByUserId(
    idUser: string,
  ): Promise<RefreshToken> {
    try {
      let userId = idUser;

      if(userId === undefined || userId === null) {
        throw new BadRequestException("l'id de l'utilisateur est invalide");
      }

      let getRefreshToken: RefreshToken = await this.getUserByRefreshTokenUserId(userId);

      return getRefreshToken;
    } catch (err) {
      if(err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException(
        `Impossible de récupérer le token de rafraîchissement ${err.message}`,
      );
    }
  }

  /**
   * Vérifie si le token de rafraîchissement est valide et non expiré.
   * @param token 
   * @returns 
   */
  async decodeJwtToken(token: string): Promise<jwt.JwtPayload | null> {
    try {
      // Vérifie si le token est valide et renvoie le 
      console.log('Decoding Token:', token);
      return await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      if(error instanceof jwt.JsonWebTokenError){
        throw new UnauthorizedException('Token invalide');
      }else if(error instanceof jwt.TokenExpiredError){
        throw new UnauthorizedException('Token expiré');
      }else{
        throw new InternalServerErrorException(`Erreur du serveur, impossible de décoder le token: ${error.message}`);
      }
    }
  }


  /**
   * Décode le token de JWT et recuperer les données de l'utilisateur.
   * @param token - JWT token a décodé.
   * @returns Si le token est valide, sinon null.
   */
  async decodeAndFetchUserData(token: string): Promise<User | null> {
    try {
      const decodedToken: jwt.JwtPayload = await this.decodeJwtToken(token);

      if (decodedToken) {
        // Fetcher les données de l'utilisateur en fonction du token décodé
        const user = await this.usersService.findUserById(decodedToken.id.toString());

        return user || null;
      }

      return null;
    } catch (error) {
      console.error(`Erreur lors de la décodage du token JWT : ${error.message}`);
      // On envoie une réponse générique à l'utilisateur pour des raisons de sécurité
      throw new UnauthorizedException("Accès non autorisé");
    }
  }

  /**
   * Rafraîchit le token d'accès en utilisant le token de rafraîchissement.
   * @param refreshToken - Token de rafraîchissement à utiliser.
   * @returns Nouveau token d'accès généré.
   * @throws BadRequestException si le rafraîchissement du token d'accès échoue.
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const refreshTokenPayload: jwt.JwtPayload | null = await this.decodeJwtToken(
        refreshToken,
      );

      if (!refreshTokenPayload || !('id' in refreshTokenPayload)) {
        throw new BadRequestException('Token de rafraîchissement invalide');
      }

      const user: User = await this.usersService.findUserById(
        refreshTokenPayload.id.toString(),
      );

      if (!user) {
        throw new BadRequestException('Utilisateur introuvable');
      }

      const accessTokenPayload: AuthInterfaceResponseInterface = {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        pseudo: user.pseudo,
        isElectricCar: user.isElectricCar,
      };

      return this.jwtService.sign(accessTokenPayload, {
        expiresIn: jwtConstants.refreshExpiration,
      });

    } catch (error) {
      throw new BadRequestException('Token de rafraîchissement invalide');
    }
  }

  /**
   * Décrypte le token d'accès et retourne les informations contenues dans celui-ci.
   * @param accessToken - Token d'accès à décrypter.
   * @returns Informations contenues dans le token d'accès.
   * @throws BadRequestException si le décryptage du token d'accès échoue.
   */
  decodeAccessToken(accessToken: string): string | jwt.JwtPayload {
    try {
      return jwt.verify(accessToken, jwtConstants.secret);
    } catch (error) {
      throw new BadRequestException("Token d'accès invalide");
    }
  }

  /**
   * Vérifie si le token de rafraîchissement a expiré.
   * @param refreshToken - Token de rafraîchissement à vérifier.
   * @returns True si le token de rafraîchissement a expiré, sinon False.
   */
  async isRefreshTokenExpired(refreshToken: string): Promise<boolean> {
    try {
      // Vérifie si le token de rafraîchissement a expiré en essayant de le décrypter et renvoyer le payload
      const refreshTokenPayloadBeforeAssertion: string | jwt.JwtPayload = jwt.verify(
        refreshToken,
        jwtConstants.refreshSecret,
      );
      // Si le type de token de rafraîchissement est de type string, et que si l'exp n'est pas présent dans le token, on lance une exception BadRequestException
      if(typeof refreshTokenPayloadBeforeAssertion === "string" || !("exp" in refreshTokenPayloadBeforeAssertion)){
        throw new BadRequestException("Le token payload n'est pas valide");
      }

      /* 
      * Si le type de token de rafraîchissement est de type string, et que si l'exp est dans le token, on peut caster refreshTokenPayloadBeforeAssertion en ExpRefreshMiddleWareResponseInterface 
      en utilisant une assertion de type,et le mettre dans une variable refreshTokenPayload de type ExpRefreshMiddleWareResponseInterface
      */
      const refreshTokenPayload: ExpRefreshMiddleWareResponseInterface = refreshTokenPayloadBeforeAssertion as ExpRefreshMiddleWareResponseInterface;

      const currentTime: number = Date.now() / 1000;
      return refreshTokenPayload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
}
