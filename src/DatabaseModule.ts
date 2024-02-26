import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { Place } from './typeorm/entities/Place';
import { APIBackupStore } from './typeorm/entities/APIBackupStore';
import { User } from './typeorm/entities/User';
import { FavoritePlace } from './typeorm/entities/FavoritePlace';
import { RefreshToken } from './typeorm/entities/RefreshToken';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService): MysqlConnectionOptions => ({
          type: "mysql",
          host: configService.get<MysqlConnectionOptions["host"]>('DATABASE_HOST', 'defaultHost'),
          port: configService.get<MysqlConnectionOptions["port"]>('DATABASE_PORT', 3306),
          username: configService.get<MysqlConnectionOptions["username"]>('DATABASE_USERNAME', 'defaultUsername'),
          password:configService.get<MysqlConnectionOptions["password"]>('DATABASE_PASSWORD', 'defaultPassword'),
          database: configService.get<MysqlConnectionOptions["database"]>('DATABASE_DATABASE', 'defaultDatabase'),
          entities: [Place,User,RefreshToken, FavoritePlace, APIBackupStore],
          synchronize: configService.get<MysqlConnectionOptions["synchronize"]>('DATABASE_SYNCHRONIZE', false), // A effacer dans la production, DANGER
          supportBigNumbers: configService.get<MysqlConnectionOptions["supportBigNumbers"]>('DATABASE_SUPPORTBIGNUMBERS', false),
        }),
        inject: [ConfigService],
      })],
      exports: [TypeOrmModule]
    })


  export class DatabaseModule {}