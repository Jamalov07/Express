import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface UserAttr {
  user_id: string;

  full_name: string;
  user_name: string;
  lang: string;
  phone_number: string;
  state: string;
  message_id: string;
}
@Table({ tableName: 'userb' })
export class UserB extends Model<UserB, UserAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: number;
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  user_id: string;

  @Column({ type: DataType.STRING })
  full_name: string;
  @Column({ type: DataType.STRING })
  phone_number: string;
  @Column({ type: DataType.STRING })
  user_name: string;
  @Column({ type: DataType.STRING })
  lang: string;
  @Column({ type: DataType.STRING })
  state: string;
  @Column({ type: DataType.STRING })
  message_id: string;
}
