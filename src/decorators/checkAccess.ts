import { JwtService } from '@nestjs/jwt';
import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/entities/admin.entity';

export const CheckAccess = createParamDecorator(
  async (_, context: ExecutionContext): Promise<Partial<Admin> | String> => {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const admins = await new AdminService(
      Admin,
      new JwtService(),
    ).findAllForGuard();
    // console.log(admins)
    if (!admins.length) {
      return 'first';
    } else {
      if (!authorization) {
        throw new UnauthorizedException('Admin not authorized');
      }
      const refreshToken = authorization.split(' ')[1];
      // console.log(refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException('admin unauthorized decorator');
      }

      let adminData: Partial<Admin>;

      try {
        adminData = await new JwtService().verify(refreshToken, {
          secret: process.env.ACCESS_TOKEN_KEY,
        });
      } catch (error) {
        console.log(error);
        throw new ForbiddenException(error.message);
      }
      console.log(adminData);
      if (adminData) {
        request.admin = adminData;
        return 'no';
      }
    }
  },
);
