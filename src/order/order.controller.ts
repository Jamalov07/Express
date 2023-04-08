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
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AdminGuard } from '../guards/admin.guard';
import { ReqWithAdmin } from '../interfaces/ReqWithAdmin';
import { SearchDto } from './dto/search-order.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: ReqWithAdmin) {
    return this.orderService.create(createOrderDto, req);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get('search')
  searchOrders(@Query() orderBody: SearchDto) {
    return this.orderService.searchOrders(orderBody);
  }

  @UseGuards(AdminGuard)
  @Get('page/:page')
  teacherGroups(@Param('page') page: number) {
    return this.orderService.getPageOrder(page);
  }

  @Get('unique/:id')
  findByUnique(@Param('id') id: string) {
    return this.orderService.findByUniqueId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
