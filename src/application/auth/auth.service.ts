import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LoginDto } from '../../api/dto/auth/login.dto';
import { RegisterDto } from '../../api/dto/auth/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { RefreshTokenRepository } from '../../infrastructure/repository/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await argon2.hash(dto.password);
    const created = await this.userRepository.create({
      id: null,
      email: dto.email,
      passwordHash,
      role: 'admin',
      fullName: dto.fullName || null,
    } as any);
    return created;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    
    const isValid = await argon2.verify((user as any).passwordHash, password);
    if (!isValid) return null;
    
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Revoke all existing refresh tokens for this user (optional - for single session)
    // await this.refreshTokenRepository.revokeAllByUserId((user as any).id);

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken((user as any).id, tokens.refreshToken);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const storedTokens = await this.refreshTokenRepository.findByUserId(payload.sub);
      if (!storedTokens.length) throw new ForbiddenException('Invalid refresh token');

      const matchedToken = await (async () => {
        for (const token of storedTokens) {
          if (await argon2.verify(token.tokenHash, refreshToken)) {
            return token;
          }
        }
        return null;
      })();
      if (!matchedToken) throw new ForbiddenException('Invalid refresh token');

      // Validate expiry / revoked
      const tokenDomain = new RefreshToken(
        matchedToken.id,
        matchedToken.userId,
        matchedToken.tokenHash,
        matchedToken.expiresAt,
        matchedToken.createdAt,
        matchedToken.revokedAt,
      );

      if (!tokenDomain.isValid()) throw new ForbiddenException('Refresh token expired or revoked');

      // Revoke old token
      await this.refreshTokenRepository.revoke(matchedToken.id!);

      // Generate new tokens
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.id) {
        throw new ForbiddenException('User not found');
      }
      const tokens = await this.generateTokens(user);
      await this.storeRefreshToken(user.id, tokens.refreshToken);


      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }


  async logout(userId: string) {
    // Revoke all refresh tokens for this user
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    const accessTokenExpires = Number(this.configService.get<number>('JWT_ACCESS_EXPIRES')) || 900; // 15 minutes
    const refreshTokenExpires = this.configService.get<number>('JWT_REFRESH_EXPIRES') || 604800; // 7 days

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpires,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpires,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const tokenHash = await argon2.hash(refreshToken);
    const refreshTokenExpires = this.configService.get<number>('JWT_REFRESH_EXPIRES') || 604800;
    
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpires);

    const refreshTokenEntity = new RefreshToken(
      null,
      userId,
      tokenHash,
      expiresAt,
    );

    await this.refreshTokenRepository.create(refreshTokenEntity);
  }

  // Cleanup method - can be run as a cron job
  async cleanupExpiredTokens() {
    await this.refreshTokenRepository.deleteExpired();
  }
}