const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  file_id: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  tags: [String],
  video_length: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);
