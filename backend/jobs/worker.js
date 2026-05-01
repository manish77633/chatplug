require('dotenv').config();
const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const { connection } = require('./embeddingQueue');
const { embedDocument } = require('../services/embeddingService');
const { extractFromPDF, extractFromURL, extractFromText } = require('../services/documentService');
const Document = require('../models/Document');
const Chatbot  = require('../models/Chatbot');
const User     = require('../models/User');

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Worker: MongoDB connected'));

const worker = new Worker('embedding', async (job) => {
  const { documentId, type, buffer, url, text, chatbotId, ownerId, namespace } = job.data;
  console.log(`[Worker] Processing job ${job.id} - type: ${type}`);

  await Document.findByIdAndUpdate(documentId, { status: 'processing' });

  let extracted;
  try {
    if (type === 'pdf') {
      const buf = Buffer.from(buffer);
      extracted = await extractFromPDF(buf);
    } else if (type === 'url') {
      extracted = await extractFromURL(url);
    } else {
      extracted = extractFromText(text);
    }
  } catch (err) {
    await Document.findByIdAndUpdate(documentId, { status: 'failed', errorMessage: err.message });
    throw err;
  }

  // Embed into Pinecone
  const { chunkCount, vectorIds } = await embedDocument({
    text: extracted.text,
    documentId,
    chatbotId,
    namespace,
    metadata: { type, sourceUrl: url || '' },
  });

  // Update document with results
  await Document.findByIdAndUpdate(documentId, {
    status: 'completed',
    processedAt: new Date(),
    vectorIds,
    stats: {
      charCount:  extracted.charCount,
      chunkCount,
      pageCount:  extracted.pageCount,
      tokenCount: Math.ceil(extracted.charCount / 4), // rough estimate
    },
  });

  // Update chatbot status to ready
  await Chatbot.findByIdAndUpdate(chatbotId, { status: 'ready' });

  // Update user usage
  await User.findByIdAndUpdate(ownerId, {
    $inc: {
      'usage.totalDocuments': 1,
      'usage.currentMonth.tokens': Math.ceil(extracted.charCount / 4),
    },
  });

  console.log(`[Worker] Job ${job.id} completed - ${chunkCount} chunks embedded`);
}, { connection, concurrency: 3 });

worker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} failed:`, err.message));
worker.on('completed', (job) => console.log(`[Worker] Job ${job.id} done`));

console.log('🔧 Embedding worker started');
