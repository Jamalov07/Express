import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order) private orderRepo: typeof Order) {}

  async create(createOrderDto: CreateOrderDto) {
    const candidate = await this.orderRepo.findOne({
      where: { order_unique_id: createOrderDto.order_unique_id },
    });
    if (candidate) {
      throw new BadRequestException('This order already exists');
    }
    const newOrder = await this.orderRepo.create(createOrderDto);
    return this.findOne(newOrder.id);
  }

  async findAll() {
    const allOrders = await this.orderRepo.findAll({
      include: [
        {
          association: 'operations',
          include: [{ association: 'status' }, { association: 'admin' }],
        },
        { all: true },
      ],
    });
    if (!allOrders.length) {
      throw new NotFoundException('order not found');
    }
    return allOrders;
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      include: [
        {
          association: 'operations',
          include: [{ association: 'status' }, { association: 'admin' }],
        },
        { all: true },
      ],
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);
    await order.update(updateOrderDto);
    return order;
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    await this.orderRepo.destroy({ where: { id } });
    return { message: 'deleted', order };
  }
}
