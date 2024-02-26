import { Module, NestModule, MiddlewareConsumer, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { AuthModule } from './auth/auth.module';
import { RefreshMiddleware } from './auth/middlewares/refresh.middleware';
import { FavoritesModule } from './favorites/favorites.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { UsersController } from './users/controllers/users/users.controller';
import { validate } from './config/env.validation';
import { DatabaseModule } from './DatabaseModule';
import { CacheModule } from '@nestjs/cache-manager';
// import { CacheModule } from 'cache-manager';
import { ApibackupModule } from './apibackup/apibackup.module';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';

import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true, // Permet de se connecter plus rapidement à la base de données
      validate // Permet de valider les variables de l'environnement (.env)
    }),
    CacheModule.register({
        isGlobal: true,
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        no_ready_check: true,
        // ttl: configService.get<number>('REDIS_TTL'),
        // Il faut voire TTL (la durée de mise en cache)
     }),
    DatabaseModule, // Le module pour se connecter à la base de données 
    AuthModule,
    FavoritesModule,
    PlacesModule,
    UsersModule,
    ApibackupModule,
  ], 
})

export class AppModule implements NestModule, OnModuleInit, OnModuleDestroy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource, private configService: ConfigService){}
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RefreshMiddleware)
      .forRoutes(UsersController);
  }

  async onModuleInit(): Promise<void> {
    try{
      await this.dataSource.query(this.configService.get<string>('DATASOURCE_QUERY'));
      console.log("Connexion avec la base de données est établie")
    }catch(err){
      console.log(`Connexion échouée ${err.message}`)
    }
  }
  async onModuleDestroy(): Promise<void> {
    try{
      await this.dataSource.destroy();
      console.log("Connexion avec la base de données est fermée");
    } catch(err){
      console.log(`Erreur lors de la fermeture de la base de données: ${err.message}`)
    }
  }
}