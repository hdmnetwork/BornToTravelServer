import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
  Request,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ResetPasswordDto } from 'src/auth/dtos/resetPassword.dtos';
import { SendEmailForgotPasswordDto } from 'src/auth/dtos/SendEmailForgotPassword.dto';
import { UsersService } from 'src/users/services/users/users.service';

// DTO ici
import { SignInDto } from 'src/auth/dtos/signIn.dto';
import { User } from 'src/typeorm/entities/User';
import { AuthRequest } from 'src/auth/interfaces/AuthInterfaceExtendsRequest.interface';
import { MessageAuthResponseInterface } from 'src/auth/interfaces/MessageAuthResponse.interface';
import { RandomCodeResponseInterface } from 'src/auth/interfaces/RandomCodeResponse.interface';
import { TokenAuthResponseInterface } from 'src/auth/interfaces/TokenAuthResponse.interface';
import { EntityNotFoundError } from 'typeorm';
import { InvalidPasswordException } from 'src/utils/exceptions/InvalidPasswordException';
import {Get, Headers } from '@nestjs/common';

/**
 * Contrôleur gérant les routes liées à l'authentification des utilisateurs.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService, // Remove inject
  ) {}
  
  @Post('decode')
  async decodeToken(@Headers('authorization') authorization: string) {
    if(!authorization){
      return null;
    }

      const token = authorization.replace('Bearer ', '');
      return this.authService.decodeJwtToken(token);
    }
  

  @Get('refresh')
  async refreshAccessToken(@Headers('authorization') authorization: string) {
    const refreshToken = authorization.replace('Bearer ', '');
    return this.authService.refreshAccessToken(refreshToken);
  }

  /**
   * Connecte un utilisateur en vérifiant les informations d'identification et renvoie les tokens d'accès et de rafraîchissement.
   * @param signInDto - Objet contenant les informations d'identification de l'utilisateur.
   * @returns Tokens d'accès et de rafraîchissement.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDto): Promise<TokenAuthResponseInterface> {
    try{
      return await this.authService.signIn(
        signInDto.email,
        signInDto.password,
      );
    }catch(err){
      if(err instanceof UnauthorizedException || err instanceof BadRequestException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur est survenue lors de la connexion: ${err.message}`)
    }
  }

  /**
   * Déconnecte un utilisateur en supprimant son token de rafraîchissement.
   * @param req - Objet Request contenant les informations de l'utilisateur authentifié.
   * @returns Message de déconnexion réussie.
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Request() req: AuthRequest): Promise<MessageAuthResponseInterface> {
    try{
      const userId: number = req.user.id;
      const id: string = userId.toString();
      await this.authService.deleteRefreshTokenByUserId(id);
      return { message: 'Déconnexion réussie' };
    }catch(err){
      if(err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur est survenue lors de la deconnexion ${err.message}`)
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe à l'utilisateur.
   * @param sendEmailDto - Les données du formulaire d'envoi d'email.
   * @returns Un objet contenant un code de statut et un message indiquant le résultat de l'envoi de l'email.
   */
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  public async sendEmailForgotPassword(
    @Body() sendEmailForgotPasswordDto: SendEmailForgotPasswordDto,
  ): Promise<MessageAuthResponseInterface> {
    try {
      const userMailFound: Partial<User> = await this.userService.findUserByEmail(sendEmailForgotPasswordDto.email);
      if(!userMailFound){
        throw new NotFoundException("Aucun utilisateur n'as été trouvé avec cette adresse email.")
      }
      const randomCode: RandomCodeResponseInterface = this.authService.generateRandomCode();

      const isEmailSent: boolean = await this.authService.sendEmailForgotPassword(
        sendEmailForgotPasswordDto.email,
        randomCode.code,
      );

      if (isEmailSent) {
        this.userService.createResetPasswordToken(
          userMailFound,
          randomCode.code,
          randomCode.expirationDate,
        );
        return {
          message: 'Email envoyé avec succès.',
        };
      } else {
        return {
          message: "Erreur d'envoi de l'email.",
        };
      }
    } catch (error) {
      if(error instanceof NotFoundException || error instanceof InternalServerErrorException || error instanceof BadRequestException){
        throw error;
      }
      throw new InternalServerErrorException(`Erreur lors de l'envoi de l'email et de la creation de token de refraichissement: ${error.message}`);
    }
  }

  /**
   * Réinitialise le mot de passe de l'utilisateur à l'aide d'un token de réinitialisation.
   * @param resetPasswordDto - Les données du formulaire de réinitialisation de mot de passe.
   * @returns Un objet contenant un code de statut et un message indiquant le résultat de la réinitialisation de mot de passe.
   */
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<MessageAuthResponseInterface> {
    try {
      const user: User = await this.authService.verifyResetToken(
        resetPasswordDto.token,
      );

      if (user) {
        await this.userService.resetPassword(
          user.email,
          resetPasswordDto.newPassword,
        );
        return {
          message: 'Mot de passe réinitialisé avec succès.',
        };
      } else {
        throw new NotFoundException('Token de réinitialisation invalide.');
      }
    } catch (err) {
      if(err instanceof NotFoundException || err instanceof InternalServerErrorException || err instanceof InvalidPasswordException || err instanceof EntityNotFoundError|| err instanceof BadRequestException){
        throw err;
      }
      throw new NotFoundException(`Une erreur est survenue lors de la réinitialisation du mot de passe: ${err.message}`);
    }
  }
}