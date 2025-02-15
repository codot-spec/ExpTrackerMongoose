const mongoose = require('mongoose');

const downloadedContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference User model
  url: { type: String, required: true },
  filename: { type: String, required: true },
}, { timestamps: true });

const DownloadedContent = mongoose.model('DownloadedContent', downloadedContentSchema);

module.exports = DownloadedContent;