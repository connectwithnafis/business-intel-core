import { ISessionRepository } from 'src/domain/interfaces/repositories/session.repository.interface';
import { Session } from 'src/domain/entities/session.domain';
import { Repository, LessThan } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(
    private readonly repo: Repository<SessionEntity>
  ) {}

  private toDomain(entity: SessionEntity): Session {
    return new Session(
      entity.id,
      entity.userId,
      entity.expiresAt,
      entity.revoked,
      entity.lastUsedAt,
      entity.ip,
      entity.userAgent,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(domain: Session): SessionEntity {
    const entity = new SessionEntity();
    if (domain.id) entity.id = domain.id;
    entity.userId = domain.userId;
    entity.expiresAt = domain.expiresAt;
    entity.revoked = domain.revoked;
    entity.lastUsedAt = domain.lastUsedAt;
    entity.ip = domain.ip;
    entity.userAgent = domain.userAgent;
    return entity;
  }

  async create(session: Session): Promise<Session> {
    const entity = this.toEntity(session);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Session | null> {
    const entity = await this.repo.findOne({
      where: { id }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const entities = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const entities = await this.repo.find({
      where: {
        userId,
        revoked: false,
      },
      order: { lastUsedAt: 'DESC' }
    });
    return entities
      .filter(e => new Date(e.expiresAt) > new Date())
      .map(e => this.toDomain(e));
  }

  async updateLastUsed(sessionId: string, ip?: string, userAgent?: string): Promise<void> {
    const updateData: any = { lastUsedAt: new Date() };
    if (ip) updateData.ip = ip;
    if (userAgent) updateData.userAgent = userAgent;
    
    await this.repo.update(sessionId, updateData);
  }

  async revoke(sessionId: string): Promise<void> {
    await this.repo.update(sessionId, { revoked: true });
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  async deleteExpired(): Promise<void> {
    await this.repo.delete({
      expiresAt: LessThan(new Date())
    });
  }

  async delete(sessionId: string): Promise<void> {
    await this.repo.delete(sessionId);
  }
}