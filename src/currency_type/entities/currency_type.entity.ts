import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface CurrencyTypeAttr {
  name: string;
  description: string;
}

@Table({ tableName: 'currencytype' })
export class CurrencyType extends Model<CurrencyType, CurrencyTypeAttr> {
  @ApiProperty({
    example: 1,
    description: 'cuurrency type id',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @ApiProperty({ example: 'UZS', description: 'currency name' })
  @Column({ type: DataType.STRING })
  name: string;
  @ApiProperty({ example: 'about type', description: 'description' })
  @Column({ type: DataType.TEXT })
  description: string;
}
