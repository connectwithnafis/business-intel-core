import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ApiModule } from './api/api.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,envFilePath: '.env', }),
    DatabaseModule,
    ApiModule,
    ApplicationModule,
  ],
})
export class AppModule {}
