const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  tokens:  { type: Number, default: 0 },
}, { _id: false, timestamps: true });

const chatSessionSchema = new mongoose.Schema({
  chatbot:    { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true },
  sessionId:  { type: String, required: true, index: true },
  visitorId:  { type: String }, // anonymous visitor fingerprint
  sourceDomain: { type: String },

  messages: [messageSchema],

  // Aggregated stats
  stats: {
    totalMessages: { type: Number, default: 0 },
    totalTokens:   { type: Number, default: 0 },
    duration:      { type: Number, default: 0 }, // ms
  },

  // Feedback
  rating:  { type: Number, min: 1, max: 5 },
  comment: { type: String },

  endedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
