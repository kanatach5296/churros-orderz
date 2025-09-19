const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ここにあなたのBotトークンを入れる
const TOKEN = 'YOUR_BOT_TOKEN';
const ORDER_FILE = 'orders.json';
const ITEM_PRICE = 300;

// orders.json がなければ作る
if (!fs.existsSync(ORDER_FILE)) {
  fs.writeFileSync(ORDER_FILE, JSON.stringify([]));
}

// メッセージ受信イベント
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const content = message.content.trim();

  // !注文 コマンド例: !注文 プレーン 2
  if (content.startsWith('!注文')) {
    const parts = content.split(' ');
    if (parts.length !== 3) {
      message.reply('正しい形式は `!注文 商品名 個数` です');
      return;
    }
    const [_, product, quantityStr] = parts;
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity < 1) {
      message.reply('個数は1以上の数字で指定してください');
      return;
    }

    const order = {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      product,
      quantity
    };

    const orders = JSON.parse(fs.readFileSync(ORDER_FILE));
    orders.push(order);
    fs.writeFileSync(ORDER_FILE, JSON.stringify(orders, null, 2));

    message.reply(`注文ありがとうございます！\n商品: ${product}\n個数: ${quantity}\n合計金額: ${quantity*ITEM_PRICE}円`);
  }

  // !合計 コマンド: 全体
  if (content === '!合計') {
    const orders = JSON.parse(fs.readFileSync(ORDER_FILE));
    const total = orders.reduce((sum, o) => sum + o.quantity*ITEM_PRICE, 0);
    message.reply(`現在の合計金額: ${total}円`);
  }

  // !合計 日付 コマンド: 指定日
  if (content.startsWith('!合計 ')) {
    const date =
