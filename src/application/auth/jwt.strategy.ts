import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    
    // Debug logging
    console.log('JwtStrategy Configuration:', {
      secret: secret ? '***configured***' : 'MISSING',
      secretLength: secret?.length || 0,
    });

    if (!secret) {
      throw new Error('JWT_SECRET is not configured in JwtStrategy!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Debug logging
    console.log('JWT Payload validated:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // This object becomes the request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}