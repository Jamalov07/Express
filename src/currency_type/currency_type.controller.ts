import { CreatorGuard } from './../guards/creator.guard';
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
} from '@nestjs/common';
import { CurrencyTypeService } from './currency_type.service';
import { CreateCurrencyTypeDto } from './dto/create-currency_type.dto';
import { UpdateCurrencyTypeDto } from './dto/update-currency_type.dto';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Currency-Type')
@Controller('currency-type')
export class CurrencyTypeController {
  constructor(private readonly currencyTypeService: CurrencyTypeService) {}

  @UseGuards(CreatorGuard)
  @Post()
  create(@Body() createCurrencyTypeDto: CreateCurrencyTypeDto) {
    return this.currencyTypeService.create(createCurrencyTypeDto);
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll() {
    return this.currencyTypeService.findAll();
  }

  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyTypeService.findOne(+id);
  }

  @UseGuards(CreatorGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurrencyTypeDto: UpdateCurrencyTypeDto,
  ) {
    return this.currencyTypeService.update(+id, updateCurrencyTypeDto);
  }

  @UseGuards(CreatorGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currencyTypeService.remove(+id);
  }
}
