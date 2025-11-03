import { IUserRepository } from 'src/domain/interfaces/repositories/user.repository.interface';
import { User } from 'src/domain/entities/user';
import { Repository } from 'typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class UserRepository implements IUserRepository {
  constructor(
    private readonly repo: Repository<UserEntity>
  ) {}

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.role,
      entity.refreshTokenHash ?? null,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.role = user.role;
    entity.refreshTokenHash = user.refreshTokenHash;
    return entity;
  }

  async findById(id: string): Promise<User | null> {
    const e = await this.repo.findOneBy({ id });
    return e ? this.toDomain(e) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const e = await this.repo.findOneBy({ email });
    return e ? this.toDomain(e) : null;
  }

  async create(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.repo.update(userId, { refreshTokenHash });
  }
}