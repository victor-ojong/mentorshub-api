import { Config } from '@app/config';
import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class DatabaseModule {
  static forRoot(config: Config): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [MongooseModule.forRoot(config.db.uri)],
      exports: [MongooseModule],
    };
  }
}
