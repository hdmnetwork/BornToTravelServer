import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from 'src/typeorm/entities/User';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateUserParams, UpdateUserParams, UserEmailParam } from 'src/utils/type';
import { comparePasswords, encodePassword } from 'src/utils/bcrypt';
import { DuplicateFieldException } from 'src/utils/exceptions/DuplicateFieldException';
import { PartialUpdateException } from 'src/utils/exceptions/PartialUpdateException';
import { ValidationService } from 'src/utils/ValidationService';
import { InvalidEmailException } from 'src/utils/exceptions/InvalidEmailException';
import { InvalidPasswordException } from 'src/utils/exceptions/InvalidPasswordException';
import { InvalidFieldException } from 'src/utils/exceptions/InvalidFieldException';
import { MessageUserResponseInterface } from 'src/users/interfaces/MessageUserResponse.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private validationService: ValidationService,
  ) {}

  /**
   * Récupère tous les utilisateurs.
   * @returns Liste des utilisateurs.
   */
  async findAllUsers() {
    try{
      const userFound: User[] = await this.userRepository.find();
      if(userFound.length === 0){
        throw new NotFoundException('Aucun utilisateur trouvé')
      }
      return userFound;
    }catch(err){
      if(err instanceof NotFoundException){
        throw err;
      }
      throw new InternalServerErrorException(`Impossible de récupérer les utilisateurs: ${err.message}`)
    }
  }

  /**
   * Récupère un utilisateur par son ID.
   * @param id - ID de l'utilisateur.
   * @returns Utilisateur correspondant à l'ID.
   */
  async findUserById(id: string): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } });
    } catch (err) {
      if(err instanceof EntityNotFoundError){
        throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
      }
      throw new InternalServerErrorException(`Impossible de récuperer l'utilisateur avec l'id ${id}: ${err.message}`);
    }
  }


  /**
   * Récupère les informations de profil d'un utilisateur par son adresse email.
   * @param email - Adresse email de l'utilisateur.
   * @returns Informations partielles de profil de l'utilisateur.
   */
  async findUserDataProfile(email: string): Promise<Partial<User>> {
    try {
      const user: Partial<User> = await this.findUserByEmail(email); // changement ici
      return user;
    } catch (err) {
      if(err instanceof InternalServerErrorException || err instanceof NotFoundException){
        throw err;
      }
      throw new InternalServerErrorException(
        `Impossible de récupérer les informations de profil de l'utilisateur avec l'adresse email ${email}: ${err.message}`,
      );
    }
  }

  /**
   * Crée un nouvel utilisateur.
   * @param userDetails - Informations de l'utilisateur à créer.
   * @returns Nouvel utilisateur créé.
   */
  async createUser(userDetails: CreateUserParams, emailUserParam: UserEmailParam): Promise<User> {
    try{
    const email: string = userDetails.email;
    const password: string = userDetails.password;
    const pseudeo: string = userDetails.pseudo;

    if(typeof pseudeo !== "string"){
      throw new BadRequestException("Le format de pseudo est invalide");
    }

    if(!pseudeo){
      throw new BadRequestException("Le pseudo ne peut pas être vide");
    }

    if (!this.validationService.isEmailValid(email)) {
      throw new InvalidEmailException();
    }

    const passwordErrors: string[] = this.validationService.getPasswordErrors(
      password,
    );

    if (
      password &&
      !this.validationService.isPasswordValid(password)
    ) {
      throw new InvalidPasswordException(passwordErrors);
    }

    const existingUser: User = await this.userRepository.findOne({
      where: { email: emailUserParam.email },
    });

    if (existingUser) {
      throw new DuplicateFieldException(
        'Cette adresse email est déjà utilisée, veuillez entrer une adresse valide',
      );
    }

      if(!this.validationService.isPseudeoValid(pseudeo)){
        throw new InvalidFieldException('de pseudo');
      }
      const encodedPassword: string = encodePassword(password);
      const newUser: User = this.userRepository.create({
        ...userDetails,
        pseudo: pseudeo, // Les espaces doivent être autorisée
        password: encodedPassword,
        createdAt: new Date().toISOString(),
      });
      return await this.userRepository.save(newUser);

    
    }catch(err) {
      if(err instanceof DuplicateFieldException || err instanceof InvalidFieldException || err instanceof InvalidEmailException || err instanceof BadRequestException || err instanceof InvalidPasswordException){
        throw err;
      }
      throw new InternalServerErrorException(`Impossible de créer l'utilisateur: ${err.message}`);
    }
  }

  /**
   * Met à jour les informations d'un utilisateur par son ID.
   * @param id - ID de l'utilisateur à mettre à jour.
   * @param updateUserDetails - Informations de mise à jour de l'utilisateur.
   * @returns Résultat de la mise à jour.
   * @throws {NotFoundException} Si l'utilisateur avec l'ID donné n'existe pas.
   * @throws {DuplicateFieldException} Si l'email à mettre à jour est déjà utilisé par un autre utilisateur.
   * @throws {PartialUpdateException} Si aucune information n'a été modifiée.
   */
  async updateUser(id: string, updateUserDetails: UpdateUserParams): Promise<MessageUserResponseInterface> {
    const user: User = await this.findUserById(id);
    
    let email: string = updateUserDetails.email;
    let firstName: string = updateUserDetails.firstname;
    let lastName: string = updateUserDetails.lastname;
    let pseudeo: string = updateUserDetails.pseudo;
    let isElectricCar: boolean = updateUserDetails.isElectricCar;

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }

    if (email && email !== user.email) {
      const existingUserWithEmail: Partial<User> = await this.findUserByEmail(email);
      if (existingUserWithEmail) {
        throw new DuplicateFieldException(
          "Cette adresse email est déjà utilisée par un autre utilisateur. Veuillez modifier l'email avant de valider.",
        );
      }
      if (!this.validationService.isEmailValid(email)) {
        throw new InvalidEmailException();
      }
    }

    const modifiedFields: string[] = [];

    if (
      firstName && this.validationService.isFieldValid(firstName) &&
      firstName !== user.firstname
    ) {
      user.firstname = firstName;
      modifiedFields.push('prénom');
    } else if (!this.validationService.isFieldValid(firstName)) {
      throw new InvalidFieldException('du prénom');
    }

    if (
      lastName && this.validationService.isFieldValid(lastName) &&
      lastName !== user.lastname
    ) {
      user.lastname = lastName;
      modifiedFields.push('nom');
    } else if (!this.validationService.isFieldValid(lastName)) {
      throw new InvalidFieldException('du nom');
    }

    if (email && email !== user.email) { // A voir avec Stephen
      if (!this.validationService.isEmailValid(email)) {
        throw new InvalidEmailException();
      }
      user.email = email;
      modifiedFields.push('de l\'email');
    }

    // if (pseudeo && this.validationService.isFieldValid(pseudeo) && pseudeo !== user.pseudo) {
    if (pseudeo && this.validationService.isPseudeoValid(pseudeo) && pseudeo !== user.pseudo) {
      user.pseudo = pseudeo;
      modifiedFields.push('Du pseudo');
    } else if (!this.validationService.isPseudeoValid(pseudeo)) {
      throw new InvalidFieldException('de pseudo');
    }

    if (
      isElectricCar !== user.isElectricCar
    ) {
      user.isElectricCar = isElectricCar;
      modifiedFields.push('du véhicule électrique');
    }

    if (modifiedFields.length === 0) {
      throw new PartialUpdateException("Aucune information n'a été modifiée");
    }

     await this.userRepository.save(user);

    return {
      message: `Champ(s) ${modifiedFields.join(
        ', ',
      )} modifié(s), pas d'autres changements`,
    };
  }

  /**
   * Modifie le mot de passe d'un utilisateur par son ID.
   * @param id - ID de l'utilisateur pour lequel le mot de passe doit être modifié.
   * @param oldPassword - Ancien mot de passe.
   * @param newPassword - Nouveau mot de passe.
   * @throws {BadRequestException} Si l'ancien mot de passe est incorrect ou si le nouveau mot de passe est similaire à l'ancien.
   */
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    try{
      const user: User= await this.findUserById(id);
      const isPasswordValidCompared: boolean = await comparePasswords(oldPassword, user.password);
      if (!isPasswordValidCompared) {
        throw new BadRequestException('Ancien mot de passe incorrect');
      }
  
      if (oldPassword === newPassword) {
        throw new BadRequestException(
          "Le nouveau mot de passe doit être différent de l'ancien",
        );
      }
  
      const passwordErrors = this.validationService.getPasswordErrors(newPassword);
  
      if (!this.validationService.isPasswordValid(newPassword)) {
        throw new InvalidPasswordException(passwordErrors);
      }
  
      const encodedNewPassword: string = encodePassword(newPassword);
      user.password = encodedNewPassword;
  
      await this.userRepository.save(user);
  
    }catch(err){
      if(err instanceof BadRequestException || err instanceof InvalidPasswordException){
        throw err;
      }
      throw new InternalServerErrorException(`Impossible de changer le mot de passe: ${err.message}`);
    }
  }

  /**
   * Supprime le compte utilisateur par son ID.
   * @param id - ID de l'utilisateur à supprimer.
   * @returns Résultat de la suppression.
   */
  async deleteUser(id: string): Promise<DeleteResult> {
  // async deleteUser(idNumber: number): Promise<DeleteResult> {
    try {
      const result: DeleteResult = await this.userRepository.delete({ id });

      if (!result.affected) {
        throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
      }
      return result;
    } catch (error) {
      if(error instanceof NotFoundException){
        throw error;
      }
      throw new BadRequestException("Impossible de supprimer l'utilisateur");
    }
  }

  /**
   * Récupère un utilisateur par son adresse email.
   * @param email - Adresse email de l'utilisateur.
   * @returns Informations partielles de l'utilisateur.
   */
  async findUserByEmail(email: string): Promise<Partial<User>> {
    try{
      return await this.userRepository.findOne({
        where: { email },
      });
      
    }catch(err){
      if(err instanceof EntityNotFoundError){
        // Erreur findOneOrFail, NotFoundException est prise dans erreur InternalServerErrorException ligne 115 du méthode signIn
        throw new NotFoundException(`Utilisateur avec l'adresse mail que vous avez choisit est introuvable`);
      }
      throw new InternalServerErrorException(`Impossible de trouver l'utilisateur avec l'adresse mail ${email}: ${err.message}`)
    }
  }

  /**
   * Crée un token de réinitialisation de mot de passe pour un utilisateur.
   * @param email - Adresse e-mail de l'utilisateur.
   * @param resetToken - Token de réinitialisation généré.
   * @param expirationDate - Date d'expiration du token de réinitialisation.
   * @throws {NotFoundException} Si l'utilisateur avec l'adresse e-mail spécifiée est introuvable.
   */

  async createResetPasswordToken(
    userEmail: Partial<User>,
    resetToken: string,
    expirationDate: Date,
  ): Promise<void> {
    try {
      if (!userEmail) {
        throw new NotFoundException(`L'utilisateur ${userEmail.email} est introuvable`);
      }
      userEmail.resetPasswordToken = resetToken;
      userEmail.resetTokenExpiration = expirationDate;
      await this.userRepository.save(userEmail);
    } catch (error) {
      throw new InternalServerErrorException(
        `Impossible de créer le token de refraichissement de mot de passe: ${error.message}`);
    }
  }

  /**
   * Recherche un utilisateur par son token de réinitialisation de mot de passe.
   * @param resetPasswordToken - Token de réinitialisation de mot de passe à rechercher.
   * @returns L'utilisateur correspondant au token de réinitialisation ou null si introuvable.
   */
  async findUserByResetPasswordToken(
    resetPasswordToken: string,
  ): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { resetPasswordToken },
      });
    } catch (err) {
      if(err instanceof BadRequestException){
        throw err;
      }else if (err instanceof EntityNotFoundError) {
        throw new NotFoundException(`Utilisateur avec token de réinitialisation introuvable`);
      }
      throw new InternalServerErrorException(`Impossible de trouver l'utilisateur avec le token de réinitialisation de mot de passe: ${err.message}`);
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur.
   * @param email - Adresse e-mail de l'utilisateur.
   * @param newPassword - Le nouveau mot de passe.
   * @throws {InvalidPasswordException} Si le nouveau mot de passe est invalide.
   * @throws {NotFoundException} Si l'utilisateur avec l'adresse e-mail spécifiée est introuvable.
   */
  async resetPassword(email: string, newPassword: string): Promise<void> {
    try {
      const user: Partial<User> = await this.findUserByEmail(email);

      if(!user){
        throw new NotFoundException(`Utilisateur avec l'adresse e-mail ${email} introuvable`);
      }
      
      const passwordErrors: string[] = this.validationService.getPasswordErrors(newPassword);

      if (!this.validationService.isPasswordValid(newPassword)) {
        throw new InvalidPasswordException(passwordErrors);
      }

      user.password = encodePassword(newPassword);

      await this.userRepository.save(user);
    } catch (err) {
      if( err instanceof NotFoundException || err instanceof InvalidPasswordException){
        throw err;
      }
      throw new InternalServerErrorException(`Impossible de réinitialiser le mot de passe: ${err.message}`);
    }
  }

  /**
   * Réinitialise les champs de réinitialisation de mot de passe d'un utilisateur.
   * @param email - Adresse e-mail de l'utilisateur.
   */
  async resetResetPasswordFields(email: string): Promise<void> {
    try {
      const user: Partial<User> = await this.findUserByEmail(email);
      user.resetPasswordToken = null;
      user.resetTokenExpiration = null;
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(`Impossible de réinitialiser les champs de réinitialisation de mot de passe: ${error}`)
    }
  }
}