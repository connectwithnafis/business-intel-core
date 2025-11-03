import { IRefreshTokenRepository } from 'src/domain/interfaces/repositories/refresh-token.repository.interface';
import { RefreshToken } from 'src/domain/entities/refresh-token';
import { Repository, LessThan, IsNull } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    private readonly repo: Repository<RefreshTokenEntity>
  ) {}

  private toDomain(entity: RefreshTokenEntity): RefreshToken {
    return new RefreshToken(
      entity.id,
      entity.userId,
      entity.tokenHash,
      entity.expiresAt,
      entity.createdAt,
      entity.revokedAt,
    );
  }

  private toEntity(domain: RefreshToken): RefreshTokenEntity {
    const entity = new RefreshTokenEntity();
    if (domain.id) entity.id = domain.id;
    entity.userId = domain.userId;
    entity.tokenHash = domain.tokenHash;
    entity.expiresAt = domain.expiresAt;
    entity.revokedAt = domain.revokedAt || null;
    return entity;
  }

  async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const entity = this.toEntity(refreshToken);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const entity = await this.repo.findOne({
      where: { tokenHash }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const entities = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findValidTokenByUserId(userId: string): Promise<RefreshToken | null> {
    const entity = await this.repo.findOne({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: LessThan(new Date())
      },
      order: { createdAt: 'DESC' }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async revoke(id: string): Promise<void> {
    await this.repo.update(id, { revokedAt: new Date() });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({
      expiresAt: LessThan(new Date())
    });
  }
}