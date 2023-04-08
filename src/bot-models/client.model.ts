import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface ClientAttr {
  user_id: string;
    status: boolean;
    message_id:string
}
@Table({ tableName: 'clientb' })
export class ClientB extends Model<ClientB, ClientAttr> {
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
  @Column({ type: DataType.BOOLEAN })
  status: boolean;
  @Column({ type: DataType.STRING })
  message_id: string;
}

