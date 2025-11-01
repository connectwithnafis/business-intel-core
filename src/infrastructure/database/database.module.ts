import { Module, Global } from '@nestjs/common';
import { AppDataSource } from './data-source';
import { DataSource } from 'typeorm';

@Global()
@Module({
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: async () => {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }
        return AppDataSource;
      }
    }
  ],
  exports: ['DATA_SOURCE'],
})
export class DatabaseModule {}
