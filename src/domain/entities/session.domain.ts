export class Session {
  constructor(
    public id: string | null,
    public userId: string,
    public expiresAt: Date,
    public revoked: boolean = false,
    public lastUsedAt: Date | null = null,
    public ip: string | null = null,
    public userAgent: string | null = null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.revoked;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  updateLastUsed(ip?: string, userAgent?: string): void {
    this.lastUsedAt = new Date();
    if (ip) this.ip = ip;
    if (userAgent) this.userAgent = userAgent;
  }
}