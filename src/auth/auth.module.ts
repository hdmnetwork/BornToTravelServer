import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from 'src/typeorm/entities/RefreshToken';
import { ValidationService } from 'src/utils/ValidationService';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {
      expiresIn: "7d",
      },
    }),
  ],
  providers: [AuthService, ValidationService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
