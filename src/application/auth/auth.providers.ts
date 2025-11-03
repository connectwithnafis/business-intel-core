import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { RefreshTokenRepository } from '../../infrastructure/repository/refresh-token.repository';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { RefreshTokenEntity } from '../../infrastructure/entities/refresh-token.entity';

export const AuthProviders: Provider[] = [
  {
    provide: UserRepository,
    useFactory: (dataSource: DataSource) => {
      const repo = dataSource.getRepository(UserEntity);
      return new UserRepository(repo);
    },
    inject: ['DATA_SOURCE'],
  },
  {
    provide: RefreshTokenRepository,
    useFactory: (dataSource: DataSource) => {
      const repo = dataSource.getRepository(RefreshTokenEntity);
      return new RefreshTokenRepository(repo);
    },
    inject: ['DATA_SOURCE'],
  },
];