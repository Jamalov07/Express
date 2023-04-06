import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ReqWithAdmin } from '../interfaces/ReqWithAdmin';
import { Order } from '../order/entities/order.entity';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { Operation } from './entities/operation.entity';
import { Op } from 'sequelize';

@Injectable()
export class OperationService {
  constructor(
    @InjectModel(Operation) private operationRepo: typeof Operation,
    @InjectModel(Order) private orderRepo: typeof Order,
  ) {}

  async create(createOperationDto: CreateOperationDto, req: ReqWithAdmin) {
    const orderOperations = await this.operationRepo.findAll({
      where: { order_id: createOperationDto.order_id },
      order: [['createdAt', 'DESC']],
    });
    if (orderOperations.length) {
      if (
        createOperationDto.status_id -
          orderOperations[orderOperations.length - 1].status_id !==
          1 &&
        createOperationDto.status_id > 3
      ) {
        throw new BadRequestException(
          'Status incorrect or order operations in this order  finished',
        );
      }
    }

    let adminId = req.admin.id;
    const newOperation = await this.operationRepo.create({
      ...createOperationDto,
      admin_id: adminId,
    });

    return this.findOne(newOperation.id);
  }

  async findAll() {
    const allOperations = await this.operationRepo.findAll({
      include: { all: true },
    });
    return allOperations;
  }

  async findOne(id: number) {
    const operation = await this.operationRepo.findOne({
      where: { id },
      include: [{ all: true }],
    });
    if (!operation) {
      throw new NotFoundException('operation not found');
    }
    return operation;
  }

  async update(id: number, updateOperationDto: UpdateOperationDto) {
    const operation = await this.findOne(id);
    await operation.update(updateOperationDto);
    return operation;
  }

  async remove(id: number) {
    const operation = await this.findOne(id);
    await this.operationRepo.destroy({ where: { id } });
    return { message: 'deleted', operation };
  }

  async restartOrder(orderId: number) {
    const operations = await this.operationRepo.findAll({
      where: {
        order_id: orderId,
        description: {
          [Op.not]: null,
        },
      },
    });
    console.log(operations);
    await this.operationRepo.destroy({
      where: {
        order_id: orderId,
        description: {
          [Op.not]: null,
        },
      },
    });
    const start = await this.operationRepo.findOne({
      where: { order_id: orderId },
    });

    return start;
  }
}
