const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const chatbotSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },

  // Unique embed ID for public widget
  embedId: { type: String, default: () => uuidv4(), unique: true },

  // Knowledge base - linked documents
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],

  // Pinecone namespace for vector isolation per chatbot
  vectorNamespace: { type: String, default: function() { return this.embedId; } },

  // Bot personality & settings
  settings: {
    systemPrompt:    { type: String, default: 'You are a helpful assistant. Answer questions based only on the provided context.' },
    temperature:     { type: Number, default: 0.3, min: 0, max: 1 },
    maxTokens:       { type: Number, default: 500 },
    model:           { type: String, default: 'gpt-4o-mini' },
    language:        { type: String, default: 'en' },
    fallbackMessage: { type: String, default: "I don't have enough information to answer that." },
  },

  // Widget UI customization
  widget: {
    primaryColor:    { type: String, default: '#6366f1' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor:       { type: String, default: '#111827' },
    botName:         { type: String, default: 'AI Assistant' },
    welcomeMessage:  { type: String, default: 'Hi! How can I help you today?' },
    placeholder:     { type: String, default: 'Type your message...' },
    position:        { type: String, enum: ['bottom-right', 'bottom-left'], default: 'bottom-right' },
    avatarUrl:       { type: String, default: '' },
  },

  // Allowed domains for embed (empty = all allowed)
  allowedDomains: [{ type: String }],

  // Status
  status:     { type: String, enum: ['training', 'ready', 'error', 'draft'], default: 'draft' },
  isPublic:   { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },

  // Analytics
  stats: {
    totalChats:    { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalTokens:   { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Chatbot', chatbotSchema);
