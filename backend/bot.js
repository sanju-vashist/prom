const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const Video = require('./models/Video');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.on('video', async ctx => {
  const video = ctx.message.video;
  const caption = ctx.message.caption || '';
  
 
  const lines = caption.split('\n');
  const title = lines[0] || 'Untitled Video';
  const description = lines.slice(1).join(' ').replace(/#\w+/g, '').trim();
  const tags = (caption.match(/#\w+/g) || []).map(t => t.substring(1));

  // Only save reference (not file), but you keep the file_id for later fetching
  await Video.create({
    file_id: video.file_id,
    title: video.title,
    description,
    tags,
    video_length: video.duration
  });
  ctx.reply('Video saved to DB!');
});

bot.launch();
console.log('Telegram bot running');
