import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface OrderAttr {
  order_link: string;
  full_price: string;
  initial_payment: string;
  unique_id: string;
  admin_id: string;
  client_id: string;
  state: string;
}
@Table({ tableName: 'orderb' })
export class OrderB extends Model<OrderB, OrderAttr> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    unique: true,
  })
  id: number;
  @Column({ type: DataType.STRING })
  admin_id: string;
  @Column({ type: DataType.STRING })
  client_id: string;
  @Column({ type: DataType.STRING })
  order_link: string;
  @Column({ type: DataType.STRING })
  full_price: string;
  @Column({ type: DataType.STRING })
  initial_payment: string;
  @Column({ type: DataType.STRING })
  unique_id: string;
  @Column({ type: DataType.STRING })
  state: string;
}
