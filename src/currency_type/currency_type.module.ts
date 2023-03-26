import { Module } from '@nestjs/common';
import { CurrencyTypeService } from './currency_type.service';
import { CurrencyTypeController } from './currency_type.controller';
import { CurrencyType } from './entities/currency_type.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({}), SequelizeModule.forFeature([CurrencyType])],
  controllers: [CurrencyTypeController],
  providers: [CurrencyTypeService],
})
export class CurrencyTypeModule {}
