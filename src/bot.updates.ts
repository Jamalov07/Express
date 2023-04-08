import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  onStart(@Ctx() ctx: Context) {
    return this.botService.onStart(ctx);
  }

  @Hears("Ro'yhatdan o'tish")
  onRegister(@Ctx() ctx: Context) {
    return this.botService.onRegister(ctx);
  }

  @Hears('Hozirgi ism familiyamni tanlayman')
  onDefaultFullName(@Ctx() ctx: Context) {
    return this.botService.onDefaltFullName(ctx);
  }

  @Hears('Mahsulotga buyurtma berish')
  toClient(@Ctx() ctx: Context) {
    return this.botService.toClient(ctx);
  }

  @On('contact')
  onContact(@Ctx() ctx: Context) {
    return this.botService.onContact(ctx);
  }

  @Command('client')
  onClient(@Ctx() ctx: Context) {
    return this.botService.onClient(ctx);
  }
  @Command('admin')
  onAdmin(@Ctx() ctx: Context) {
    return this.botService.toAdmin(ctx);
  }

  @Hears("Yangi buyurtma qo'shish")
  newOrder(@Ctx() ctx: Context) {
    return this.botService.onNewOrder(ctx);
  }

  @Hears("Adminlar ro'yhati")
  adminList(@Ctx() ctx: Context) {
    return this.botService.adminList(ctx);
  }

  @Hears('Mening buyurtmalarim')
  myOrders(@Ctx() ctx: Context) {
    return this.botService.myOrders(ctx);
  }

  @Hears("Men ro'yhatga olgan buyurtmalar")
  adminOrders(@Ctx() ctx: Context) {
    return this.botService.adminOrders(ctx);
  }

  @Action(/^(accept=\d+)/)
  addAdminToOrder(@Ctx() ctx: Context) {
    return this.botService.confirmOrder(ctx);
  }

  @On('message')
  onMessage(@Ctx() ctx: Context) {
    return this.botService.onMessage(ctx);
  }
}
