import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { UsersService } from './services/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../typeorm/entities/User';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { ValidationService } from 'src/utils/ValidationService';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, ValidationService],
  exports: [UsersService, AuthService, ValidationService],
})
export class UsersModule {}
