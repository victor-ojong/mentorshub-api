import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { ValidationPipeExt } from './lib/validation-pipe-ext';
import { config, Config } from './config';

function bootstrap() {
  const appConfig: Config = config;
  const PORT = config.server.port;

  NestFactory.create(AppModule.forRoot({ config: appConfig }))
    .then((app) => {
      const logger = app.get(Logger);
      app.useLogger(logger);
      app.enableCors({
        origin: [
          'http://localhost:3000',
          'https://api-dev.mentorshub.io',
          'https://api.mentorshub.io',
          /\.mentorshub\.io$/,
        ],
        allowedHeaders: ['content-type', 'Authorization'],
        credentials: true,
      });

      app.use(helmet());

      app.useGlobalPipes(
        new ValidationPipeExt({ whitelist: true, transform: true })
      );
      app.use(passport.initialize());
      app.use(cookieParser());
      app.setGlobalPrefix('v1');

      const config = new DocumentBuilder()
        .setTitle('Mentored api docs')
        .setDescription('Mentored api docs')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'Token',
          },
          'access-token'
        )
        .build();
      const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          methodKey,
      };

      const document = SwaggerModule.createDocument(app, config, options);
      SwaggerModule.setup('api', app, document);
      app
        .listen(PORT)
        .then(() => {
          logger.log(
            `⚡️[server]: Server is running at http://localhost:${PORT}/v1`
          );
        })
        .catch((error) => {
          logger.error(`error listening on ${PORT}`, { error });
        });
    })
    .catch((error) => {
      console.log('error starting app', JSON.stringify(error));
    });
}
bootstrap();
