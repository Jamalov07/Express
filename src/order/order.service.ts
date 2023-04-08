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
import { SearchDto } from './dto/search-order.dto';
import { Op } from 'sequelize';

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

  async searchOrders(body: SearchDto) {
    const { full_name, order_unique_id, start_date, end_date } = body;
    console.log(body);

    const whereClause: any = {};

    if (full_name) {
      whereClause.full_name = {
        [Op.iLike]: `%${full_name}%`,
      };
    }

    if (order_unique_id) {
      whereClause.order_unique_id = {
        [Op.iLike]: `%${order_unique_id}%`,
      };
    }

    if (start_date && end_date) {
      whereClause.createdAt = {
        [Op.between]: [
          new Date(`${start_date}T00:00:00Z`),
          new Date(`${end_date}T23:59:59Z`),
        ],
      };
    } else if (start_date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${start_date}T00:00:00Z`),
        [Op.lt]: new Date(`${start_date}T23:59:59Z`),
      };
    } else if (end_date) {
      whereClause.createdAt = {
        [Op.gte]: new Date(`${end_date}T00:00:00Z`),
        [Op.lt]: new Date(`${end_date}T23:59:59Z`),
      };
    }

    const orders = await this.orderRepo.findAll({
      where: whereClause,
    });
    return orders;
  }

  async getPageOrder(page: number) {
    console.log(page);
    if (isNaN(+page)) {
      throw new BadRequestException('Page is not  number');
    }
    const orders = await this.orderRepo.findAll({
      offset: (page - 1) * 10,
      limit: 10,
      include: { all: true },
    });
    return orders;
  }
}
