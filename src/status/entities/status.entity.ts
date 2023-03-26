import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface StatusAttr {
  name: string;
  description: string;
}

@Table({ tableName: 'status' })
export class Status extends Model<Status, StatusAttr> {
  @ApiProperty({
    example: 1,
    description: 'status id',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @ApiProperty({ example: 'BLOCK', description: 'status name' })
  @Column({ type: DataType.STRING })
  name: string;
  @ApiProperty({ example: 'about status', description: 'description' })
  @Column({ type: DataType.TEXT })
  description: string;
}
