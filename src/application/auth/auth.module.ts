import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthControllerProvider } from './auth.providers';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET') || 'changeme',
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') || '3600s' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ...AuthControllerProvider,
  ],
  exports: [AuthService],
})
export class AuthModule {}
