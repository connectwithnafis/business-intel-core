import {IUserRepository} from 'src/domain/interfaces/repositories/user.repository.interface';
import {User} from 'src/domain/entitites/user';
import { Repository } from 'typeorm';
import { UserEntity } from '../../infrastructure/entities/user.entitty';

export class UserRepository implements IUserRepository {
  constructor(private repo: Repository<UserEntity>) {}

  private toDomain(entity: UserEntity): User {
    return new User(entity.id, entity.email, entity.passwordHash, entity.role);
  }

  async findById(id: string) {
    const e = await this.repo.findOneBy({ id });
    return e ? this.toDomain(e) : null;
  }

  async findByEmail(email: string) {
    const e = await this.repo.findOneBy({ email });
    return e ? this.toDomain(e) : null;
  }

  async create(user: User) {
    const ent = this.repo.create({
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role
    });
    const saved = await this.repo.save(ent);
    return this.toDomain(saved);
  }
}