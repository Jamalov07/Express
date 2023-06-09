import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthBody } from './dto/auth-admin.dto';
import { Request, Response } from 'express';
import { ReqWithAdmin } from '../interfaces/ReqWithAdmin';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin) private adminRepo: typeof Admin,
    private jwtService: JwtService,
  ) {}

  async create(createAdminDto: CreateAdminDto, req: ReqWithAdmin, str: string) {
    let isCreator = true;
    if (str === 'no') {
      isCreator = false;
      if (req.admin) {
        if (!req.admin.is_creator) {
          throw new BadRequestException('Admin is not creator');
        }
      }
    }

    const userNameCandidate = await this.adminRepo.findOne({
      where: { user_name: createAdminDto.user_name },
    });
    if (userNameCandidate) {
      throw new BadRequestException('This admin already exists');
    }
    const hashed_password = await bcrypt.hash(
      createAdminDto.hashed_password,
      7,
    );
    const newAdmin = await this.adminRepo.create({
      ...createAdminDto,
      is_creator: isCreator,
      is_active: true,
      hashed_password: hashed_password,
    });
    return this.findOne(newAdmin.id);
  }

  async update(id: number, updateAdminDto: UpdateAdminDto, req: ReqWithAdmin) {
    if (!req.admin.is_creator) {
      if (req.admin.id !== id) {
        throw new BadRequestException('You do not have permission to do this');
      }
    }

    const admin = await this.findOne(id);

    if (updateAdminDto.user_name) {
      const userNameCandidate = await this.adminRepo.findOne({
        where: { user_name: updateAdminDto.user_name },
      });
      if (userNameCandidate && userNameCandidate.id != id) {
        throw new BadRequestException('This admin already exists');
      }
    }
    await admin.update({
      ...updateAdminDto,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
      hashed_password: admin.hashed_password,
      hashed_token: admin.hashed_token,
    });
    const tokens = await this.getTokens(
      admin.id,
      admin.is_active,
      admin.is_creator,
    );

    const updatedAdmin = await this.updateHashedToken(
      admin.id,
      tokens.refresh_token,
    );
    return { admin: updatedAdmin, tokens };
  }

  async login(authBody: AuthBody, res: Response) {
    const { user_name, password } = authBody;

    const admin = await this.adminRepo.findOne({ where: { user_name } });
    if (!admin) {
      throw new UnauthorizedException('Admin is not registered1');
    }
    if (!admin.is_active) {
      throw new BadRequestException('Admin is not active');
    }
    const ifTrue = await bcrypt.compare(password, admin.hashed_password);
    if (!ifTrue) {
      throw new UnauthorizedException('Admin is not registered2');
    }
    const tokens = await this.getTokens(
      admin.id,
      admin.is_active,
      admin.is_creator,
    );

    const updatedAdmin = await this.updateHashedToken(
      admin.id,
      tokens.refresh_token,
    );
    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { admin: updatedAdmin, tokens };
  }

  async logout(req: ReqWithAdmin, res: Response) {
    const admin = await this.findOne(req.admin.id);
    await admin.update({ hashed_token: null });
    res.clearCookie('refresh_token');
    return { admin, action: 'logout' };
  }

  async refreshToken(refreshToken: string, req: ReqWithAdmin, res: Response) {
    const admin = await this.adminRepo.findOne({ where: { id: req.admin.id } });
    if (!admin || !admin.hashed_token) {
      throw new BadRequestException(
        'Admin not found or his refresh column is empty',
      );
    }
    const refreshMatches = await bcrypt.compare(
      refreshToken,
      admin.hashed_token,
    );
    if (!refreshMatches) {
      throw new ForbiddenException(
        'A change has been made to the refresh token',
      );
    }
    const tokens = await this.getTokens(
      admin.id,
      admin.is_active,
      admin.is_creator,
    );
    const updatedAdmin = await this.updateHashedToken(
      admin.id,
      tokens.refresh_token,
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { admin: updatedAdmin, tokens: tokens };
  }

  async activate(id: number) {
    const admin = await this.findOne(id);
    // if (admin.is_active == true) {
    //   throw new BadRequestException('Admin is already activated');
    // }
    await admin.update({ is_active: true });
    return { message: 'admin is activated', admin };
  }

  async deActivate(id: number) {
    const admin = await this.findOne(id);
    // if (!admin.is_active) {
    //   throw new BadRequestException('Admin is already inactive');
    // }
    await admin.update({ is_active: false });
    return { message: 'Admin is inactivated', admin };
  }

  async remove(id: number, req: ReqWithAdmin) {
    if (!req.admin.is_creator) {
      if (req.admin.id !== id) {
        throw new BadRequestException('You do not have permission to do this');
      }
    }
    const admin = await this.findOne(id);
    await this.adminRepo.destroy({ where: { id } });
    return { message: 'deleted', admin };
  }

  async findAll() {
    const allAdmin = await this.adminRepo.findAll({
      include: { all: true },
      order: [['createdAt', 'DESC']],
    });
    // if (!allAdmin.length) {
    //   throw new NotFoundException('admins not found');
    // }
    return allAdmin;
  }

  async findAllForGuard() {
    const allAdmin = await this.adminRepo.findAll({ include: { all: true } });
    return allAdmin;
  }

  async findOne(id: number) {
    const admin = await this.adminRepo.findOne({
      where: { id },
      include: { all: true },
    });
    if (!admin) {
      throw new NotFoundException('admin not found');
    }
    return admin;
  }

  async getOne(id: number, req: ReqWithAdmin) {
    if (!req.admin.is_creator) {
      if (req.admin.id !== id) {
        throw new BadRequestException('You do not have permission to do this');
      }
    }
    const admin = await this.adminRepo.findOne({
      where: { id },
      include: { all: true },
    });
    if (!admin) {
      throw new NotFoundException('admin not found');
    }
    return admin;
  }

  // ======================================================

  async getTokens(adminId: number, is_active: boolean, is_creator: boolean) {
    const jwtPayload = {
      id: adminId,
      is_active,
      is_creator,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateHashedToken(adminId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 7);
    await this.adminRepo.update(
      { hashed_token: hashedRefreshToken },
      { where: { id: adminId } },
    );
    return this.findOne(adminId);
  }

  async checkToken(data: { token: string }) {
    try {
      // console.log(data.token, 'buuu');
      if (data.token) {
        const adminData = new JwtService().verify(data.token, {
          secret: process.env.ACCESS_TOKEN_KEY,
        });

        if (adminData) {
          if (
            adminData.id &&
            adminData.is_active !== undefined &&
            adminData.is_creator !== undefined
          ) {
            const admin = await this.adminRepo.findOne({
              where: { id: adminData.id },
              include: { all: true },
            });
            if (admin) {
              return { isValid: true, admin };
            }
          }
          console.log(adminData);
        }
      }
      return { isValid: false };
    } catch (error) {
      console.log(error);
      return { isValid: false, error: error.message };
    }
  }
}
