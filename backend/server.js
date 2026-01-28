const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Video = require('./models/Video');
require('dotenv').config();

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

// List all videos
app.get('/api/videos', async (req, res) => {
  const videos = await Video.find().sort({ date: -1 });
  res.json(videos);
});

app.get('/api/video-file/:file_id', async (req, res) => {
  
  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getFile?file_id=${req.params.file_id}`;
  const fileResp = await fetch(TELEGRAM_API).then(r => r.json());
  const filePath = fileResp.result.file_path;
  const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${filePath}`;
  res.redirect(fileUrl);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
