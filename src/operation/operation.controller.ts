import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OperationService } from './operation.service';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { AdminGuard } from '../guards/admin.guard';
import { CreatorGuard } from '../guards/creator.guard';

@ApiTags('Operations')
@Controller('operation')
export class OperationController {
  constructor(private readonly operationService: OperationService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createOperationDto: CreateOperationDto, @Req() req) {
    return this.operationService.create(createOperationDto, req);
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.operationService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operationService.findOne(+id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOperationDto: UpdateOperationDto,
  ) {
    return this.operationService.update(+id, updateOperationDto);
  }

  @UseGuards(CreatorGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operationService.remove(+id);
  }
}
