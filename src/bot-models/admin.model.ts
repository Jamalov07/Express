import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface AdminAttr {
  user_id: string;
  username: string;
  password: string;
  is_active: boolean;
  status: boolean;
  is_creator: boolean;
  message_id: string;
}
@Table({ tableName: 'adminb' })
export class AdminB extends Model<AdminB, AdminAttr> {
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
  username: string;
  @Column({ type: DataType.STRING })
  password: string;
  @Column({ type: DataType.BOOLEAN })
  is_active: boolean;
  @Column({ type: DataType.BOOLEAN })
  status: boolean;
  @Column({ type: DataType.BOOLEAN })
  is_creator: boolean;
  @Column({ type: DataType.STRING })
  message_id: string;
}
