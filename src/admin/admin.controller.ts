import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CheckAccess } from '../decorators/checkAccess';
import { cookieGetter } from '../decorators/cookieGetter';
import { AdminGuard } from '../guards/admin.guard';
import { CreatorGuard } from '../guards/creator.guard';
import { ReqWithAdmin } from '../interfaces/ReqWithAdmin';
import { AdminService } from './admin.service';
import { AuthBody } from './dto/auth-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(
    @Body() createAdminDto: CreateAdminDto,
    @CheckAccess() str: string,
    @Req() req: ReqWithAdmin,
  ) {
    return this.adminService.create(createAdminDto, req, str);
  }

  @Post('login')
  login(@Body() authBody: AuthBody, @Res({ passthrough: true }) res: Response) {
    return this.adminService.login(authBody, res);
  }

  @UseGuards(AdminGuard)
  @Post('refresh')
  refresh(
    @Req() req: ReqWithAdmin,
    @cookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.refreshToken(refreshToken, req, res);
  }

  @UseGuards(AdminGuard)
  @Post('logout')
  logout(@Req() req: ReqWithAdmin, @Res({ passthrough: true }) res: Response) {
    return this.adminService.logout(req, res);
  }

  @UseGuards(CreatorGuard)
  @Post('activate')
  activate(@Body() admin: { adminId: number }) {
    return this.adminService.activate(admin.adminId);
  }

  @UseGuards(CreatorGuard)
  @Post('deactivate')
  deactivate(@Body() admin: { adminId: number }) {
    return this.adminService.deActivate(admin.adminId);
  }

  @UseGuards(CreatorGuard)
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: ReqWithAdmin) {
    return this.adminService.getOne(+id, req);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @Req() req: ReqWithAdmin,
  ) {
    return this.adminService.update(+id, updateAdminDto, req);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: ReqWithAdmin) {
    return this.adminService.remove(+id, req);
  }
}
