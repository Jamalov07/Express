import {
  BadRequestException,
  ForbiddenException,
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

    const emailCandidate = await this.adminRepo.findOne({
      where: { email: createAdminDto.email },
    });
    if (emailCandidate) {
      throw new BadRequestException('This admin already exists');
    }

    const phoneNumberCandidate = await this.adminRepo.findOne({
      where: { phone_number: createAdminDto.phone_number },
    });
    if (phoneNumberCandidate) {
      throw new BadRequestException('This admin already exists');
    }

    const tgLinkCandidate = await this.adminRepo.findOne({
      where: { tg_link: createAdminDto.tg_link },
    });
    if (tgLinkCandidate) {
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
    if (updateAdminDto.email) {
      const emailCandidate = await this.adminRepo.findOne({
        where: { email: updateAdminDto.email },
      });
      if (emailCandidate && emailCandidate.id != id) {
        throw new BadRequestException('This admin already exists');
      }
    }

    if (updateAdminDto.phone_number) {
      const phoneNumberCandidate = await this.adminRepo.findOne({
        where: { phone_number: updateAdminDto.phone_number },
      });
      if (phoneNumberCandidate && phoneNumberCandidate.id != id) {
        throw new BadRequestException('This admin already exists');
      }
    }

    if (updateAdminDto.tg_link) {
      const tgLinkCandidate = await this.adminRepo.findOne({
        where: { tg_link: updateAdminDto.tg_link },
      });
      if (tgLinkCandidate && tgLinkCandidate.id != id) {
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
    if (admin.is_active == true) {
      throw new BadRequestException('Admin is already activated');
    }
    await admin.update({ is_active: true });
    return { message: 'admin is activated', admin };
  }

  async deActivate(id: number) {
    const admin = await this.findOne(id);
    if (!admin.is_active) {
      throw new BadRequestException('Admin is already inactive');
    }
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
    const allAdmin = await this.adminRepo.findAll({ include: { all: true } });
    if (!allAdmin.length) {
      throw new NotFoundException('admins not found');
    }
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
}
