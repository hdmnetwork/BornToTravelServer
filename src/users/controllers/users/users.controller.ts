import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dtos/CreateUser.dto';
import { UpdateUserDto } from 'src/users/dtos/UpdateUser.dto';
import { UsersService } from 'src/users/services/users/users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { RefreshMiddleware } from 'src/auth/middlewares/refresh.middleware';
import { ChangePasswordDto } from 'src/users/dtos/ChangePassword.dto';
import { DuplicateFieldException } from 'src/utils/exceptions/DuplicateFieldException';
import { PartialUpdateException } from 'src/utils/exceptions/PartialUpdateException';
import { InvalidEmailException } from 'src/utils/exceptions/InvalidEmailException';
import { InvalidFieldException } from 'src/utils/exceptions/InvalidFieldException';
import { EmailUserDto } from 'src/users/dtos/EmailUser.dto';
import { AuthRequest } from 'src/users/interfaces/UpdateUser.interface';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { User } from 'src/typeorm/entities/User';
import { MessageUserResponseInterface } from 'src/users/interfaces/MessageUserResponse.interface';
import { InvalidPasswordException } from 'src/utils/exceptions/InvalidPasswordException';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  /**
   * Récupère tous les utilisateurs.
   * @returns Liste des utilisateurs.
   */
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @Get()
  async getAllUsers(): Promise<User[]> {
    try{
      return this.userService.findAllUsers();
    }catch(err){
      if(err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException("Une erreur interne s'est produite pendant la récupération des utilisateurs")
    }
  }

  /**
   * Récupère un utilisateur par son ID.
   * @param id - ID de l'utilisateur.
   * @returns Utilisateur correspondant à l'ID.
   */
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @Get(':id')
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User>  {
    try{
      return this.userService.findUserById(id);
    }catch(err){
      if(err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException("Une erreur interne s'est produite pendant la récupération de l'utilisateur")
    }
  }

  /**
   * Récupère un utilisateur par son adresse email en utilisant un token d'accès valide.
   * @param userEmail - Adresse email de l'utilisateur.
   * @returns Informations de profil de l'utilisateur.
   */
  @UseInterceptors(ClassSerializerInterceptor, CacheInterceptor)
  @UseGuards(AuthGuard, RefreshMiddleware)
  @Get('email/:email')
  async getUserByEmail(@Param('email') userEmail: string): Promise<Partial<User>> {
    try{
      return this.userService.findUserDataProfile(userEmail);
    }catch(err){
      if(err instanceof NotFoundException || err instanceof InternalServerErrorException){
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur internes'est produite pendant la récupération de l'utilisateur ${userEmail}`);
    }
  }

  /**
   * Crée un nouvel utilisateur.
   * @param createUserDto - Objet contenant les informations de l'utilisateur à créer.
   * @returns Nouvel utilisateur créé.
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto, @Body() emailUserDto: EmailUserDto): Promise<User> {
    try{
      return await this.userService.createUser(createUserDto, emailUserDto);
    }catch(err){
      if(err instanceof DuplicateFieldException || err instanceof InvalidFieldException || err instanceof InvalidEmailException || err instanceof InvalidFieldException || err instanceof BadRequestException || err instanceof InvalidPasswordException){
        throw err;
      }
      throw new InternalServerErrorException("Une erreur interne s'est produite pendant la création de l'utilisateur");
    }
  }

  /**
   * Met à jour les informations d'un utilisateur par son ID en utilisant un token d'accès valide.
   * @param userIdFromRequest - ID de l'utilisateur à mettre à jour.
   * @param updateUserDto - Objet contenant les informations de mise à jour de l'utilisateur.
   * @param req - Objet Request d'Express.
   * @returns Message de succès.
   */
  @UseGuards(AuthGuard, RefreshMiddleware)
  @Put(':id')
  async updateUserById(
    @Param('id', ParseUUIDPipe) userIdFromRequest: string, // ici peut être ca marche pas
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthRequest,
  ): Promise<MessageUserResponseInterface> {
    const userIdFromToken: string = req.user.id;

    if (userIdFromToken === userIdFromRequest) {
      try {
        return await this.userService.updateUser(
          userIdFromRequest,
          updateUserDto,
        );
      } catch (err) {
        if (
          err instanceof PartialUpdateException ||
          err instanceof InvalidEmailException ||
          err instanceof DuplicateFieldException ||
          err instanceof InvalidFieldException ||
          err instanceof BadRequestException
        ) {
          throw err;
        } else {
          throw new InternalServerErrorException(
            "Une erreur interne s'est produite",
          );
        }
      }
    } else {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à modifier ce compte",
      );
    }
  }

  /**
   * Modifie le mot de passe d'un utilisateur par son ID en utilisant un token d'accès valide.
   * @param userIdFromRequest - ID de l'utilisateur pour lequel le mot de passe doit être modifié.
   * @param changePasswordDto - Objet contenant les informations de changement de mot de passe.
   * @param req - Objet Request d'Express.
   * @returns Message de succès.
   */
  @UseGuards(AuthGuard, RefreshMiddleware)
  @Put('change-password/:id')
  async changePasswordById(
    @Param('id', ParseUUIDPipe) userIdFromRequest: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: AuthRequest,
  ): Promise<MessageUserResponseInterface> {
    try {
    const userIdFromToken: string = req.user.id;

    if (userIdFromToken === userIdFromRequest) {
        await this.userService.changePassword(
          userIdFromRequest,
          changePasswordDto.oldPassword,
          changePasswordDto.newPassword,
        );

        return { message: 'Mot de passe modifié avec succès' };
    } else {
      throw new UnauthorizedException(
        "Vous n'êtes pas autorisé à modifier ce mot de passe",
      );
    }} catch (err) {
      if(err instanceof BadRequestException || err instanceof UnauthorizedException || err instanceof InvalidPasswordException){
        throw err;
      }
      throw new InternalServerErrorException(`Une erreur interne s'est produite pendant la modification du mot de passe: ${err.message}`);
    }
  }

  /**
   * Supprime le compte utilisateur par son ID en utilisant un token d'accès valide.
   * @param req - Objet Request d'Express.
   * @param userIdFromRequest - ID de l'utilisateur à supprimer.
   * @returns Message de succès.
   */
  @UseGuards(AuthGuard, RefreshMiddleware)
  @Delete(':id')
  async deleteUserAccount(
    // @Param('id', ParseIntPipe) userIdFromRequest: number,
    @Param('id', ParseUUIDPipe) userIdFromRequest: string,
    @Request() req: AuthRequest,
  ): Promise<MessageUserResponseInterface> {
      try {
        const userIdFromToken = req.user.id;
        // const userIdFromToken: number = +req.user.id;

        if (userIdFromToken !== userIdFromRequest) {
          throw new UnauthorizedException(
            "Vous n'êtes pas autorisé à supprimer ce compte",
          );
        }

        const refreshToken: RefreshToken = await this.authService.getRefreshTokenByUserId(
          userIdFromToken,
        );
        if (refreshToken) {
          await this.authService.deleteRefreshTokenByUserId(
            refreshToken.userId,
          );
        }

        await this.userService.deleteUser(userIdFromToken);

        return { message: 'Compte supprimé avec succès' };
      } catch (err) {
        if(err instanceof BadRequestException || err instanceof NotFoundException || err instanceof InternalServerErrorException || err instanceof UnauthorizedException){
          throw err;
        }
          throw new InternalServerErrorException("Une erreur interne s'est produite pendant la suppression");
      }
  }
}
