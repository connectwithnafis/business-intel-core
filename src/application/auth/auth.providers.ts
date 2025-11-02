import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { UserEntity } from '../../infrastructure/entities/user.entity';

export const AuthControllerProvider: Provider[] = [
  {
    provide: UserRepository,
    useFactory: (dataSource: DataSource) => {
      const repo = dataSource.getRepository(UserEntity);
      return new UserRepository(repo);
    },
    inject: ['DATA_SOURCE'],
  },
];
