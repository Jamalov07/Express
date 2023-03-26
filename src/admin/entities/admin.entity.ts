import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface AdminAttr {
  full_name: string;
  user_name: string;
  hashed_password: string;
  phone_number: string;
  email: string;
  tg_link: string;
  hashed_token: string;
  is_active: boolean;
  description: string;
  is_creator: boolean;
}

@Table({ tableName: 'admin' })
export class Admin extends Model<Admin, AdminAttr> {
  @ApiProperty({
    example: 1,
    description: 'Admin id',
  })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;
  @ApiProperty({ example: "Jamalov No'monjon", description: 'Admin full name' })
  @Column({ type: DataType.STRING })
  full_name: string;
  @ApiProperty({ example: 'Jamalov07', description: 'Admin user name' })
  @Column({ type: DataType.STRING })
  user_name: string;
  @ApiProperty({ example: '******', description: 'Admin hashed password' })
  @Column({ type: DataType.STRING })
  hashed_password: string;
  @ApiProperty({
    example: '+998 94 917 41 27',
    description: 'Admin phone number',
  })
  @Column({ type: DataType.STRING })
  phone_number: string;
  @ApiProperty({ example: 'JamalovN07@gmail.com', description: 'Admin email' })
  @Column({ type: DataType.STRING })
  email: string;
  @ApiProperty({
    example: '@New_Prime_Minister_of_Uzbekistan',
    description: 'telegram username',
  })
  @Column({ type: DataType.STRING })
  tg_link: string;
  @ApiProperty({ example: '*****', description: 'Admin hashed token' })
  @Column({ type: DataType.STRING })
  hashed_token: string;
  @ApiProperty({ example: true, description: 'Admin status' })
  @Column({ type: DataType.BOOLEAN })
  is_active: boolean;
  @ApiProperty({ example: 'about me', description: 'descprition' })
  @Column({ type: DataType.TEXT })
  description: string;
  @ApiProperty({ example: true, description: 'Admin status' })
  @Column({ type: DataType.BOOLEAN })
  is_creator: boolean;
}
