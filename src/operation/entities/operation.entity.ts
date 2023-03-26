import { Admin } from './../../admin/entities/admin.entity';
import { Status } from './../../status/entities/status.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from '../../order/entities/order.entity';

interface OperationAttr {
  order_unique_id: string;
  status_id: number;
  operation_date: Date;
  admin_id: number;
  description: string;
}

@Table({ tableName: 'operation' })
export class Operation extends Model<Operation, OperationAttr> {
  @ApiProperty({
    example: 1,
    description: 'operation id',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'Order id' })
  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER })
  order_id: number;
  @BelongsTo(() => Order)
  order: Order;

  @ApiProperty({ example: 1, description: 'status id' })
  @ForeignKey(() => Status)
  @Column({ type: DataType.INTEGER })
  status_id: number;
  @BelongsTo(() => Status)
  status: Status;

  @ApiProperty({ example: '12-12-2012', description: 'Order updated date' })
  @Column({ type: DataType.DATE })
  operation_date: Date;

  @ApiProperty({ example: 2, description: 'Admin id' })
  @ForeignKey(() => Admin)
  @Column({ type: DataType.INTEGER })
  admin_id: number;
  @BelongsTo(() => Admin)
  admin: Admin;

  @ApiProperty({
    example: 'about update',
    description: 'Operation description',
  })
  @Column({ type: DataType.TEXT })
  description: string;
}
