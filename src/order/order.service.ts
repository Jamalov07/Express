import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Operation } from '../operation/entities/operation.entity';
import { ReqWithAdmin } from '../interfaces/ReqWithAdmin';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order) private orderRepo: typeof Order,
    @InjectModel(Operation) private operationRepo: typeof Operation,
  ) {}

  async create(createOrderDto: CreateOrderDto, req: ReqWithAdmin) {
    const newOrder = await this.orderRepo.create(createOrderDto);
    await newOrder.update({ order_unique_id: String(newOrder.id + 1000) });
    await this.operationRepo.create({
      admin_id: req.admin.id,
      order_id: newOrder.id,
      status_id: 1,
    });
    return this.findOne(newOrder.id);
  }

  async findAll() {
    const allOrders = await this.orderRepo.findAll({
      include: [
        {
          association: 'operations',
          include: [{ association: 'admin' }],
        },
        { all: true },
      ],
    });
    return allOrders;
  }

  async findByUniqueId(unique: string) {
    const order = await this.orderRepo.findOne({
      where: { order_unique_id: unique },
      include: [
        {
          association: 'operations',
          include: [{ association: 'admin' }],
        },
        { all: true },
      ],
    });
    if (!order) {
      return { message: 'order not found' };
    }
    return order;
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne({
      where: { id },
      include: [
        {
          association: 'operations',
          include: [{ association: 'admin' }],
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
