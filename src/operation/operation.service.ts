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

@Injectable()
export class OperationService {
  constructor(
    @InjectModel(Operation) private operationRepo: typeof Operation,
    @InjectModel(Order) private orderRepo: typeof Order,
  ) {}

  async create(createOperationDto: CreateOperationDto, req: ReqWithAdmin) {
    let date = new Date();
    let adminId = req.admin.id;
    const newOperation = await this.operationRepo.create({
      ...createOperationDto,
      operation_date: date,
      admin_id: adminId,
    });
    if (createOperationDto.order_id) {
      await this.orderRepo.update(
        { truck: createOperationDto.truck },
        { where: { id: createOperationDto.order_id } },
      );
    }
    return this.findOne(newOperation.id);
  }

  async findAll() {
    const allOperations = await this.operationRepo.findAll({
      include: { all: true },
    });
    if (!allOperations.length) {
      throw new BadRequestException('operation not found');
    }
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
}
