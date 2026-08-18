import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        phone: string;
        type: string;
      }>(token, {
        secret: process.env.JWT_SECRET,
      });
      (req as unknown as { user: unknown }).user = {
        id: payload.sub,
        phone: payload.phone,
      };
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
