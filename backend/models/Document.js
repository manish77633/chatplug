const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  owner:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  chatbot: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true },

  name:     { type: String, required: true },
  type:     { type: String, enum: ['pdf', 'url', 'text'], required: true },
  sourceUrl: { type: String }, // for URL type

  // Processing status
  status:       { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  errorMessage: { type: String },
  jobId:        { type: String }, // BullMQ job id

  // Stats after processing
  stats: {
    charCount:   { type: Number, default: 0 },
    chunkCount:  { type: Number, default: 0 },
    tokenCount:  { type: Number, default: 0 },
    pageCount:   { type: Number, default: 0 },
  },

  // Pinecone vector IDs for cleanup
  vectorIds: [{ type: String }],

  processedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
