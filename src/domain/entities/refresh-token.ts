export class RefreshToken {
  constructor(
    public id: string | null,
    public userId: string,
    public tokenHash: string,
    public expiresAt: Date,
    public createdAt?: Date,
    public revokedAt?: Date | null,
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isRevoked(): boolean {
    return this.revokedAt !== null && this.revokedAt !== undefined;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }
}