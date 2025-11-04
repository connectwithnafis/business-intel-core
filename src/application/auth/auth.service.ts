import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LoginDto } from '../../api/dto/auth/login.dto';
import { RegisterDto } from '../../api/dto/auth/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { SessionRepository } from '../../infrastructure/repository/session.repository';
import { Session } from '../../domain/entities/session.domain';

export interface SessionMetadata {
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await argon2.hash(dto.password);
    const created = await this.userRepository.create({
      id: null,
      email: dto.email,
      passwordHash,
      role: 'user',
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

  async login(dto: LoginDto, metadata?: SessionMetadata) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // optional for revoke old sessions if needed 
    // await this.sessionRepository.revokeAllByUserId((user as any).id);

    const refreshTokenExpires = this.configService.get<number>('JWT_REFRESH_EXPIRES') || 604800; // 7 days
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpires);

    const newSession = new Session(
      null,
      (user as any).id,
      expiresAt,
      false,
      new Date(),
      metadata?.ip || null,
      metadata?.userAgent || null,
    );

    const savedSession = await this.sessionRepository.create(newSession);
    const tokens = await this.generateTokens(user, savedSession.id!);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async refreshTokens(refreshToken: string, metadata?: SessionMetadata) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (!payload.sess) {
        throw new ForbiddenException('Invalid refresh token: missing session ID');
      }

      const session = await this.sessionRepository.findById(payload.sess);
      if (!session) {
        throw new ForbiddenException('Session not found');
      }

      if (!session.isValid()) {
        throw new ForbiddenException('Session expired or revoked');
      }

      if (session.userId !== payload.sub) {
        throw new ForbiddenException('Session user mismatch');
      }

      await this.sessionRepository.updateLastUsed(
        session.id!,
        metadata?.ip,
        metadata?.userAgent,
      );

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.id) {
        throw new ForbiddenException('User not found');
      }

      const shouldRotate = this.configService.get<boolean>('JWT_REFRESH_ROTATION') ?? false;

      if (shouldRotate) {
        await this.sessionRepository.revoke(session.id!);

        const refreshTokenExpires = this.configService.get<number>('JWT_REFRESH_EXPIRES') || 604800;
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + refreshTokenExpires);

        const newSession = new Session(
          null,
          user.id,
          expiresAt,
          false,
          new Date(),
          metadata?.ip || null,
          metadata?.userAgent || null,
        );

        const savedSession = await this.sessionRepository.create(newSession);
        const tokens = await this.generateTokens(user, savedSession.id!);

        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        };
      } else {
        const tokens = await this.generateTokens(user, session.id!);
        
        return {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        };
      }
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await this.sessionRepository.revoke(sessionId);
    } else {
      await this.sessionRepository.revokeAllByUserId(userId);
    }
    return { message: 'Logged out successfully' };
  }

  async listSessions(userId: string) {
    const sessions = await this.sessionRepository.findActiveByUserId(userId);
    return sessions.map(s => ({
      sessionId: s.id,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
      expiresAt: s.expiresAt,
      ip: s.ip,
      userAgent: s.userAgent,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Session not found or unauthorized');
    }
    await this.sessionRepository.revoke(sessionId);
    return { message: 'Session revoked successfully' };
  }

  private async generateTokens(user: any, sessionId: string) {
    const accessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    const refreshPayload = {
      sub: user.id,
      sess: sessionId, 
    };

    const accessTokenExpires = Number(this.configService.get<number>('JWT_ACCESS_EXPIRES')) || 900; 
    const refreshTokenExpires = this.configService.get<number>('JWT_REFRESH_EXPIRES') || 604800;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: accessTokenExpires,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpires,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async cleanupExpiredSessions() {
    await this.sessionRepository.deleteExpired();
  }
}