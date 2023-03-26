import { CurrencyType } from './../../currency_type/entities/currency_type.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Operation } from '../../operation/entities/operation.entity';

interface OrderAttr {
  order_unique_id: string;
  full_name: string;
  phone_number: string;
  product_link: string;
  summa: number;
  currency_type_id: number;
  truck: string;
  description: string;
}

@Table({ tableName: 'order' })
export class Order extends Model<Order, OrderAttr> {
  @ApiProperty({
    example: 1,
    description: 'Order id',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @ApiProperty({ example: 'a10321', description: 'Order unique id' })
  @Column({ type: DataType.STRING })
  order_unique_id: string;
  
  @ApiProperty({ example: 'Sobirov Komil', description: 'Client full name' })
  @Column({ type: DataType.STRING })
  full_name: string;
  @ApiProperty({
    example: '+998 99 919 19 19',
    description: 'Client phone number',
  })
  @Column({ type: DataType.STRING })
  phone_number: string;
  @ApiProperty({ example: 'https://tg.org.....', description: 'product link' })
  @Column({ type: DataType.STRING })
  product_link: string;
  @ApiProperty({ example: '120 000', description: 'Product summa' })
  @Column({ type: DataType.DECIMAL })
  summa: number;

  @ApiProperty({ example: 1, description: 'Currency type id' })
  @ForeignKey(() => CurrencyType)
  @Column({ type: DataType.INTEGER })
  currency_type_id: number;
  @BelongsTo(() => CurrencyType)
  currencyType: CurrencyType;

  @ApiProperty({ example: '10a103aa', description: 'Truck symbol' })
  @Column({ type: DataType.STRING })
  truck: string;
  @ApiProperty({
    example: 'about order',
    description: 'Order description',
  })
  @Column({ type: DataType.TEXT })
  description: string;

  @HasMany(() => Operation)
  operations: Operation[];
}
