import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCurrencyTypeDto } from './dto/create-currency_type.dto';
import { UpdateCurrencyTypeDto } from './dto/update-currency_type.dto';
import { CurrencyType } from './entities/currency_type.entity';

@Injectable()
export class CurrencyTypeService {
  constructor(
    @InjectModel(CurrencyType) private currencyTypeRepo: typeof CurrencyType,
  ) { }
  
  async create(createCurrencyTypeDto: CreateCurrencyTypeDto) {
    const candidate = await this.currencyTypeRepo.findOne({
      where: { name: createCurrencyTypeDto.name },
    });
    if (candidate) {
      throw new BadRequestException('This currencyType already exists');
    }
    const newCurrencyType = await this.currencyTypeRepo.create(
      createCurrencyTypeDto,
    );
    return this.findOne(newCurrencyType.id);
  }

  async findAll() {
    const allCurrencyTypes = await this.currencyTypeRepo.findAll({
      include: { all: true },
    });
    if (!allCurrencyTypes.length) {
      throw new NotFoundException('currencyType not found');
    }
    return allCurrencyTypes;
  }

  async findOne(id: number) {
    const currencyType = await this.currencyTypeRepo.findOne({
      where: { id },
      include: { all: true },
    });
    if (!currencyType) {
      throw new NotFoundException('currencyType not found');
    }
    return currencyType;
  }

  async update(id: number, updateCurrencyTypeDto: UpdateCurrencyTypeDto) {
    const currencyType = await this.findOne(id);
    await currencyType.update(updateCurrencyTypeDto);
    return currencyType;
  }

  async remove(id: number) {
    const currencyType = await this.findOne(id);
    await this.currencyTypeRepo.destroy({ where: { id } });
    return { message: 'deleted', currencyType };
  }
}
