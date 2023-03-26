import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/entities/admin.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
      throw new UnauthorizedException('admin unauthorized1');
    }
    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('admin unauthorized2');
    }
    async function verify(
      token: string,
      jwtService: JwtService,
    ): Promise<boolean> {
      try {
        const admin: Partial<Admin> = await jwtService.verify(token, {
          secret: process.env.ACCESS_TOKEN_KEY,
        });
        if (!admin) {
          throw new UnauthorizedException('invalid token');
        }
        if (!admin.is_active) {
          throw new BadRequestException('Admin is not active');
        }
        req.admin = admin;
        return true;
      } catch (error) {
        console.log(error);
        throw new ForbiddenException(error.message);
      }
    }
    return verify(token, this.jwtService);
  }
}
