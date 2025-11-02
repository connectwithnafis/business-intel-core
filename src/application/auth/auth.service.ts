import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginDto } from '../../api/dto/auth/login.dto';
import { RegisterDto } from '../../api/dto/auth/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../infrastructure/repository/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName || null,
    } as any);
    return created;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(password, (user as any).passwordHash);
    if (!ok) return null;
    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: (user as any).id, email: (user as any).email, role: (user as any).role || 'user' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
