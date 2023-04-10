import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserB } from './bot-models/user.model';
import { AdminB } from './bot-models/admin.model';
import { ClientB } from './bot-models/client.model';
import { OrderB } from './bot-models/order.model';
import { Context, Markup, Telegraf } from 'telegraf';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BotNameService {
  bot: Telegraf;
  constructor() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);
  }
}

@Injectable()
export class BotService {
  constructor(
    @InjectModel(UserB) private userRepo: typeof UserB,
    @InjectModel(AdminB) private adminRepo: typeof AdminB,
    @InjectModel(ClientB) private clientRepo: typeof ClientB,
    @InjectModel(OrderB) private orderRepo: typeof OrderB,
    private readonly botnameService: BotNameService,
  ) {}

  async onStart(ctx: Context) {
    console.log(1);
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    console.log(user);
    if (user) {
      if (user.state === 'full_name') {
        await ctx.reply("To'liq ism familiyangizni kiriting", {
          parse_mode: 'HTML',
          ...Markup.keyboard([['Hozirgi ism familiyamni tanlayman']])
            .oneTime()
            .resize(),
        });
      } else if (user.state === 'phone_number') {
        await ctx.reply('Telefon raqam yuborish tugmasini bosing', {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqam yuborish')],
          ])
            .oneTime()
            .resize(),
        });
      } else if (user.state === 'finish') {
        await ctx.reply(`Hayrli kun ${user.full_name}`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['Mahsulotga buyurtma berish']])
            .oneTime()
            .resize(),
        });
      }
    } else {
      await this.userRepo.create({
        user_name: ctx.from.username,
        user_id: `${ctx.from.id}`,
        state: 'start',
      });
      await ctx.reply(
        "Assalomu alaykum botga hush kelibsiz. Botdan foydalanish uchun ro'yhatdan o'tishingiz lozim",
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([["Ro'yhatdan o'tish"]])
            .resize()
            .oneTime(),
        },
      );
    }
  }

  async onRegister(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      await user.update({ state: 'full_name' });
      await ctx.reply("To'liq ism familiyangizni kiriting", {
        parse_mode: 'HTML',
        ...Markup.keyboard([['Hozirgi ism familiyamni tanlayman']])
          .oneTime()
          .resize(),
      });
    } else {
      await ctx.reply('/start');
    }
  }

  async onDefaltFullName(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      if (user.state === 'full_name') {
        let fullname =
          `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}` ||
          'Anonim';
        await user.update({
          full_name: fullname,
          state: 'phone_number',
        });
        await ctx.reply('Telefon raqam yuborish tugmasini bosing', {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqam yuborish')],
          ])
            .oneTime()
            .resize(),
        });
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async onContact(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      if ('contact' in ctx.message)
        if (user.state === 'phone_number') {
          await user.update({
            phone_number: ctx.message.contact.phone_number,
            state: 'finish',
          });
          await ctx.reply(
            "Ro'yhatdan o'tish yakunlandi. Botdan bemalol foydalanishingiz mumkin",
            {
              parse_mode: 'HTML',
              ...Markup.keyboard([['Mahsulotga buyurtma berish']])
                .oneTime()
                .resize(),
            },
          );
        }
    } else {
      await ctx.reply('/start');
    }
  }

  async onMessage(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      if ('text' in ctx.message) {
        if (user.state === 'full_name') {
          await user.update({
            full_name: ctx.message.text,
            state: 'phone_number',
          });
          await ctx.reply('Telefon raqam yuborish tugmasini bosing', {
            parse_mode: 'HTML',
            ...Markup.keyboard([
              [Markup.button.contactRequest('Telefon raqam yuborish')],
            ])
              .oneTime()
              .resize(),
          });
        }
        const client = await this.clientRepo.findOne({
          where: { user_id: user.user_id },
        });
        if (client) {
          if (client.status) {
            const order = await this.orderRepo.findOne({
              where: { client_id: user.user_id },
              order: [['createdAt', 'DESC']],
            });
            if (order) {
              if (order.state === 'link') {
                await order.update({
                  order_link: ctx.message.text,
                  state: 'price',
                });
                await ctx.reply("Buyurtmaning to'liq narxini kiriting", {
                  parse_mode: 'HTML',
                  ...Markup.keyboard([['Bekor qilish']])
                    .oneTime()
                    .resize(),
                });
              } else if (order.state === 'price') {
                await order.update({
                  full_price: ctx.message.text,
                  state: 'initial_payment',
                });
                await ctx.reply(
                  "Buyurtmaga to'lamoqchi bo'lgan boshlang'ich to'lovingizni kiriting",
                  {
                    parse_mode: 'HTML',
                    ...Markup.keyboard([['Bekor qilish']])
                      .oneTime()
                      .resize(),
                  },
                );
              } else if (order.state === 'initial_payment') {
                await order.update({
                  initial_payment: ctx.message.text,
                  state: 'admin',
                });
                const admins = await this.adminRepo.findAll({
                  where: { is_active: true },
                });
                let str: string = '';
                str += `📅 Qabul qilindi: ${new Date().toDateString()}\n`;
                str += `🔗 Buyurtma linki :${order.order_link}\n`;
                str += `💴 Buyurtma narxi: ${order.full_price}\n`;
                str += `💴 Boshlang'ich to'lov: ${order.initial_payment}\n`;
                let msg;
                for (let i = 0; i < admins.length; i++) {
                  msg = await ctx.telegram.sendMessage(admins[i].user_id, str, {
                    parse_mode: 'HTML',
                    ...Markup.inlineKeyboard([
                      [
                        Markup.button.callback(
                          '✅ Qabul qilish',
                          `accept=${order.id}`,
                        ),
                      ],
                    ]),
                  });
                  admins[i].update({ message_id: msg.message_id });
                }

                await ctx.reply(
                  'Buyurtma adminlarning tasdiqlash jarayonida, kuting. Buyurtmangiz tasdiqlanishi bilan sizga habar beramiz',
                  {
                    parse_mode: 'HTML',
                    ...Markup.keyboard([
                      ["Yangi buyurtma qo'shish"],
                      ['Mening buyurtmalarim'],
                    ])
                      .oneTime()
                      .resize(),
                  },
                );
              }
            }
          }
        }
        const admin = await this.adminRepo.findOne({
          where: {
            user_id: user.user_id,
          },
        });
        console.log(admin);
        if (admin) {
          if (!admin.username && !admin.password) {
            console.log(ctx.message.text);
            let body = ctx.message.text.split(' ');
            let options = {
              user_name: body[0],
              password: body[1],
            };
            if (options.user_name && options.password) {
              let adminData: any = {};
              try {
                const response = await axios.post(
                  'http://localhost:3000/admin/login',
                  options,
                );
                console.log(response.data);
                adminData = response.data;
              } catch (error) {
                console.log(error);
                await ctx.reply('Username yoki passwordingiz hato');
              }
              if (adminData) {
                if (adminData.admin) {
                  await admin.update({
                    password: options.password,
                    username: options.user_name,
                    is_active: adminData.admin.is_active,
                    is_creator: adminData.admin.is_creator,
                  });
                  await ctx.reply(
                    "Tabriklaymiz siz Admin bo'limiga muvaffaqiyatli o'tdingiz!",
                    {
                      parse_mode: 'HTML',
                      ...Markup.keyboard([
                        ["Men ro'yhatga olgan buyurtmalar"],
                        [admin.is_creator ? "Adminlar ro'yhati" : ''],
                      ])
                        .oneTime()
                        .resize(),
                    },
                  );
                }
              }
            } else {
              await ctx.reply("Notog'ri tartibda kiritilgan ma'lumotlar");
            }
          }
        }
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async confirmOrder(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const admin = await this.adminRepo.findOne({
        where: { user_id: user.user_id },
      });
      if (admin) {
        if ('match' in ctx) {
          console.log(ctx.match['input']);
          const id = ctx.match['input'].split('=')[1];
          const order = await this.orderRepo.findOne({ where: { id: id } });
          console.log(order);
          if (order && !order.admin_id) {
            try {
              let options = {
                user_name: admin.username,
                password: admin.password,
              };
              const response1 = await axios.post(
                'http://localhost:3000/admin/login',
                options,
              );
              if (
                response1.data &&
                response1.data.admin &&
                response1.data.tokens
              ) {
                let orderUser = await this.userRepo.findOne({
                  where: { user_id: order.client_id },
                });
                if (orderUser) {
                  let token = response1.data.tokens.access_token;
                  let options2 = {
                    full_name: orderUser.full_name,
                    phone_number: orderUser.phone_number,
                    product_link: order.order_link,
                    summa: +order.full_price,
                    advance_payment: +order.initial_payment,
                  };
                  const response = await axios.post(
                    'http://localhost:3000/order',
                    options2,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  );
                  if (response.data) {
                    console.log(response.data);
                    await order.update({
                      admin_id: admin.user_id,
                      unique_id: response.data.order_unique_id,
                      state: 'finish',
                    });
                    await ctx.telegram.deleteMessage(
                      admin.user_id,
                      +admin.message_id,
                    );
                    let date = new Date();
                    let str = date.toISOString().split('T');
                    let fixeddate =
                      str[0] +
                      ' ' +
                      str[1].split('.')[0].split(':').slice(0, 2).join(':');
                    let strToChannel: string = `📆 Qabul qilindi: ${fixeddate}\n`;
                    strToChannel += `📦 Buyurtma 🆔 #${order.unique_id}\n`;
                    strToChannel += `💷 Buyurtma narxi: ${order.full_price}$\n`;
                    strToChannel += `👤 Buyurtmachi: ${orderUser.full_name}\n`;
                    strToChannel += `📱 Tel: ${orderUser.phone_number}\n`;
                    strToChannel += '--------------------------------\n\n';
                    strToChannel += `💷 Oldindan to'lov: ${order.initial_payment}$\n`;
                    strToChannel += `🔗 Buyurtma linki: ${order.order_link}\n\n`;
                    strToChannel += `😎 Qabul qildi: ${user.full_name}`;

                    await ctx.telegram.sendMessage(
                      process.env.GROPU_TOKEN,
                      strToChannel,
                    );
                    await ctx.telegram.sendMessage(
                      orderUser.user_id,
                      "Ohirgi yuborgan buyurtmangiz muvaffaqqiyatli qo'shildi",
                    );
                    await ctx.reply(
                      "Buyurtma muvaffaqqiyatli qo'shildi. Batafsil malumotni saytdan olishingiz mumkin",
                    );
                  }
                }
              }
            } catch (error) {
              await ctx.reply("Buyurtmani qo'shishda hatolik yuzag keldi");
            }
          } else {
            await ctx.reply(
              "Ozgina kech qoldingiz boshqa admin bu buyurtmani o'z nomi bilan ro'yhatdan o'tkazdi",
            );
          }
        }
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async toClient(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      if (user.state === 'finish') {
        await ctx.replyWithHTML("botga <b> /client </b> buyrug'ini bering");
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async onClient(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const client = await this.clientRepo.findOne({
        where: { user_id: `${ctx.from.id}` },
      });
      const admin = await this.adminRepo.findOne({
        where: {
          user_id: user.user_id,
        },
      });
      if (client) {
        await client.update({ status: true });
        if (admin) {
          await admin.update({ status: false });
        }
        await ctx.reply("Client tizimiga muvaffaqiyatli o'tdingiz");
        await ctx.reply("Kerakli bo'limni tanlang", {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            ["Yangi buyurtma qo'shish"],
            ['Mening buyurtmalarim'],
          ])
            .oneTime()
            .resize(),
        });
      } else {
        await this.clientRepo.create({
          user_id: user.user_id,
          status: true,
        });
        await ctx.reply(
          `Assalomu alaykum ${user.full_name}. Botning client bo'limiga hush kelibsiz`,
        );
        await ctx.reply("Kerakli bo'limni tanlang", {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            ["Yangi buyurtma qo'shish"],
            ['Mening buyurtmalarim'],
          ])
            .oneTime()
            .resize(),
        });
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async myOrders(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const client = await this.clientRepo.findOne({
        where: { user_id: user.user_id },
      });
      if (client) {
        const allOrders = await this.orderRepo.findAll({
          where: {
            client_id: user.user_id,
          },
        });
        if (allOrders.length) {
          let str: string = '';
          str += `Umumiy buyurtmalar soni ${allOrders.length} ta\n\n`;
          for (let i = 0; i < allOrders.length; i++) {
            str += `${i + 1}. ${allOrders[i].order_link} ---- ${
              allOrders[i].admin_id
                ? "Ro'yhatga qo'shilgan"
                : "Qo'shilishi kutilmoqda"
            }\n`;
          }
          str += "\nBatafsil ma'lumotni sayt orqali olishingiz mumkin!";
          await ctx.reply(str);
        } else {
          await ctx.reply('Sizda hali buyurtmalar mavjud emas!');
        }
      } else {
      }
    } else {
      await ctx.reply('./start');
    }
  }

  async onNewOrder(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const client = await this.clientRepo.findOne({
        where: { user_id: `${ctx.from.id}` },
      });
      if (client) {
        if (client.status) {
          await this.orderRepo.destroy({
            where: { client_id: user.user_id, state: 'link' },
          });

          await this.orderRepo.create({
            client_id: user.user_id,
            state: 'link',
          });
          await ctx.reply('Buyurtma linkini kiriting');
        }
      } else {
        await ctx.reply('/start');
      }
    } else {
      await ctx.reply('/start');
    }
  }

  //
  async toAdmin(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const admin = await this.adminRepo.findOne({
        where: { user_id: user.user_id },
      });
      const client = await this.clientRepo.findOne({
        where: { user_id: user.user_id },
      });
      if (client) {
        client.update({ status: false });
      }
      if (admin) {
        if (admin.username && admin.password) {
          console.log(admin.is_creator);
          await admin.update({ status: true });
          await ctx.reply("Admin tizimiga muvaffaqiyatli o'tdingiz", {
            parse_mode: 'HTML',
            ...Markup.keyboard([
              ["Men ro'yhatga olgan buyurtmalar"],
              [admin.is_creator ? "Adminlar ro'yhati" : ''],
            ])
              .oneTime()
              .resize(),
          });
        } else {
          await ctx.reply(
            "Admin bo'lib kirish uchun sizga berilgan username va passwordni kiriting.",
          );
          await ctx.replyWithHTML('Masalan: <b>admin01 admin001</b>');
        }
      } else {
        await this.adminRepo.create({
          user_id: user.user_id,
        });
        await ctx.reply(
          "Assalomu alaykum, Botning Admin bo'limiga hush kelibsiz!",
        );
        await ctx.reply(
          "Admin bo'lib kirish uchun sizga berilgan username va passwordni kiriting.",
        );
        await ctx.replyWithHTML('Masalan: <b>admin01 admin001</b>');
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async adminList(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const admin = await this.adminRepo.findOne({
        where: { user_id: user.user_id },
      });
      if (admin) {
        // console.log(admin, 'admin');
        if (admin.password && admin.username && admin.is_creator) {
          let str: string = '';
          try {
            let options = {
              user_name: admin.username,
              password: admin.password,
            };
            const response1 = await axios.post(
              'http://localhost:3000/admin/login',
              options,
            );
            console.log(response1.data);
            if (
              response1.data &&
              response1.data.admin &&
              response1.data.tokens
            ) {
              let token = response1.data.tokens.access_token;
              const response2 = await axios.get('http://localhost:3000/admin', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              if (response2.data) {
                // console.log(response2.data);
                str =
                  str + `Umumiy adminlar soni ${response2.data.length} ta\n\n`;
                for (let i = 0; i < response2.data.length; i++) {
                  str += `${response2.data[i].is_creator ? '⭐️' : '👮‍♂️'}${
                    i + 1
                  } ${response2.data[i].full_name} ${
                    response2.data[i].is_active ? '✅' : '❌'
                  }\n`;
                }
                await ctx.reply(str);
              }
            }
          } catch (error) {
            console.log(error);
            await ctx.reply("Hozircha adminlar ro'yhati bo'sh");
          }
        }
      } else {
      }
    } else {
      await ctx.reply('/start');
    }
  }

  async adminOrders(ctx: Context) {
    const user = await this.userRepo.findOne({
      where: { user_id: `${ctx.from.id}` },
    });
    if (user) {
      const admin = await this.adminRepo.findOne({
        where: { user_id: user.user_id },
      });
      if (admin) {
        const orders = await this.orderRepo.findAll({
          where: { admin_id: admin.user_id },
        });
        if (orders.length) {
          let str = `Siz qo'shgan buuyrtmalar soni ${orders.length} ta\n\n`;
          for (let i = 0; i < orders.length; i++) {
            str += `${i + 1}. ${orders[i].order_link}\n`;
          }
          str += "To'liq malumotni saytdan olishingiz mumkin!";
          await ctx.reply(str);
        } else {
          await ctx.reply('Sizda hali buyurtma mavjud emas');
        }
      }
    } else {
      await ctx.reply('/start');
    }
  }

  @Cron('0 12 1/2 * *')
  async checkDay() {
    try {
      const creator = await this.adminRepo.findOne({
        where: { is_creator: true },
      });
      const response1 = await axios.post('http://localhost:3000/admin/login', {
        user_name: creator.username,
        password: creator.password,
      });
      // console.log(response1.data);
      let token = response1.data.tokens.access_token;
      const response = await axios.get('http://localhost:3000/order', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let orders = response.data;
      try {
        orders.forEach(async (order, index) => {
          if (order.operations.length != 3) {
            setTimeout(async () => {
              await this.botnameService.bot.telegram.sendMessage(
                process.env.GROUP_TOKEN,
                `${order.order_unique_id} li buyurtmaning vaqti o'tib ketdi`,
              );
            }, index * 5000);

            console.log(order);
          }
        });
      } catch (error) {
        console.log(1);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
