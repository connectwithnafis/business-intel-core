import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { SessionRepository } from '../../infrastructure/repository/session.repository';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { SessionEntity } from '../../infrastructure/entities/session.entity';

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
    provide: SessionRepository,
    useFactory: (dataSource: DataSource) => {
      const repo = dataSource.getRepository(SessionEntity);
      return new SessionRepository(repo);
    },
    inject: ['DATA_SOURCE'],
  },
];