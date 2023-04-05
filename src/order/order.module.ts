import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { Operation } from '../operation/entities/operation.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({}),
    SequelizeModule.forFeature([Order, Operation]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
