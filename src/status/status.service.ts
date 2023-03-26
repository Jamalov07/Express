import { Status } from './entities/status.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusService {
  constructor(@InjectModel(Status) private statusRepo: typeof Status) {}
  async create(createStatusDto: CreateStatusDto) {
    const candidate = await this.statusRepo.findOne({
      where: { name: createStatusDto.name },
    });
    if (candidate) {
      throw new BadRequestException('This status already exists');
    }
    const newStatus = await this.statusRepo.create(createStatusDto);
    return this.findOne(newStatus.id);
  }

  async findAll() {
    const allStatus = await this.statusRepo.findAll({ include: { all: true } });
    if (!allStatus.length) {
      throw new NotFoundException('Status not found');
    }
    return allStatus;
  }

  async findOne(id: number) {
    const status = await this.statusRepo.findOne({
      where: { id },
      include: { all: true },
    });
    if (!status) {
      throw new NotFoundException('Status not found');
    }
    return status;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);
    await status.update(updateStatusDto);
    return status;
  }

  async remove(id: number) {
    const status = await this.findOne(id);
    await this.statusRepo.destroy({ where: { id } });
    return { message: 'deleted', status };
  }
}
