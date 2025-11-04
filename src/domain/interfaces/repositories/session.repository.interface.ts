import { Session } from "../../entities/session.domain";

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  findActiveByUserId(userId: string): Promise<Session[]>;
  updateLastUsed(sessionId: string, ip?: string, userAgent?: string): Promise<void>;
  revoke(sessionId: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteExpired(): Promise<void>;
  delete(sessionId: string): Promise<void>;
}