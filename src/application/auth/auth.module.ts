import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuthProviders } from './auth.providers';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<number>('JWT_ACCESS_EXPIRES') || 900;
        
        console.log('JWT Module Configuration:', {
          secret: secret ? '***configured***' : 'MISSING',
          expiresIn,
        });

        if (!secret) {
          throw new Error('JWT_SECRET is not configured!');
        }

        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn,
          },
        };
      },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    ...AuthProviders,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}