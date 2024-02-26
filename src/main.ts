import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  //app.enableCors();
  app.use(cors());

  await app.listen(3000);
}
bootstrap();
