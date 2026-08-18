import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  SendSmsDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('sms/send')
  async sendSms(@Body() dto: SendSmsDto) {
    const devCode = await this.auth.sendSms(dto.phone, dto.purpose);
    return { data: { sent: true, ...(devCode ? { devCode } : {}) } };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return { data: await this.auth.register(dto.phone, dto.code, dto.password, dto.agreed) };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return { data: await this.auth.login(dto.phone, dto.password) };
  }

  @Post('password/reset')
  async reset(@Body() dto: ResetPasswordDto) {
    return { data: await this.auth.resetPassword(dto.phone, dto.code, dto.newPassword) };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return { data: await this.auth.refresh(dto.refreshToken) };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    return { data: await this.auth.logout(dto.refreshToken) };
  }
}
