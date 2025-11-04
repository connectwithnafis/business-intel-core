import { Body, Controller, Get, HttpCode, HttpStatus, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RegisterDto } from '../dto/auth/register.dto';
import { LoginDto } from '../dto/auth/login.dto';
import { RefreshTokenDto } from '../dto/auth/refresh-token.dto';
import { AuthService } from '../../application/auth/auth.service';
import type { SessionMetadata } from '../../application/auth/auth.service';
import { JwtAuthGuard } from '../../application/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../application/auth/guards/roles.guard';
import { CurrentUser } from '../../application/auth/decorators/current-user.decorator';
import { Roles } from '../../application/auth/decorators/roles.decorator';
import { RequestMetadata } from '../../application/auth/decorators/request-metadata.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({ status: 400, description: 'Email already in use' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    const { passwordHash, ...safe } = user as any;
    return { user: safe };
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login and get access & refresh tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @RequestMetadata() metadata: SessionMetadata,
  ) {
    return this.authService.login(dto, metadata);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({ status: 403, description: 'Invalid refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @RequestMetadata() metadata: SessionMetadata,
  ) {
    return this.authService.refreshTokens(dto.refreshToken, metadata);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate all sessions' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved',
  })
  async listSessions(@CurrentUser() user: any) {
    return this.authService.listSessions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID to revoke' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Session not found or unauthorized' })
  async revokeSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(user.id, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (JWT protected)' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
  })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin-only')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin only endpoint example' })
  @ApiResponse({ status: 200, description: 'Admin access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  getAdminData(@CurrentUser() user: any) {
    return { message: 'This is admin-only data', user };
  }
}