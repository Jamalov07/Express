import { Status } from './status/entities/status.entity';
import { CurrencyType } from './currency_type/entities/currency_type.entity';
import { Admin } from './admin/entities/admin.entity';
import { Operation } from './operation/entities/operation.entity';
import { Order } from './order/entities/order.entity';
import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { OperationModule } from './operation/operation.module';
import { AdminModule } from './admin/admin.module';
import { CurrencyTypeModule } from './currency_type/currency_type.module';
import { StatusModule } from './status/status.module';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.updates';
import { UserB } from './bot-models/user.model';
import { AdminB } from './bot-models/admin.model';
import { OrderB } from './bot-models/order.model';
import { ClientB } from './bot-models/client.model';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [],
      useFactory: () => ({
        token: '5866586224:AAHMx6wSLE3_8lZ-bd_l4mNLta7L6tokHBM',
        middlewares: [],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    SequelizeModule.forFeature([AdminB, UserB, ClientB, OrderB]),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Order, Operation, Admin, UserB, AdminB, OrderB, ClientB],
      autoLoadModels: true,
      logging: false,
    }),
    OrderModule,
    OperationModule,
    AdminModule,
  ],

  providers: [BotService, BotUpdate],
})
export class AppModule {}
