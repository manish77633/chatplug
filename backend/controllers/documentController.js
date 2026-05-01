const multer = require('multer');
const Document = require('../models/Document');
const Chatbot  = require('../models/Chatbot');
const { embedDocument, deleteDocumentVectors } = require('../services/embeddingService');
const { extractFromPDF, extractFromURL, extractFromText } = require('../services/documentService');
const User = require('../models/User');

// Memory storage
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('file');

/**
 * Upload and immediately process a document (no separate worker needed)
 */
exports.uploadDocument = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.chatbotId, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });

    const { type, url, text } = req.body;
    if (!['pdf', 'url', 'text'].includes(type))
      return res.status(400).json({ success: false, message: 'Invalid type' });

    // Create document record
    const doc = await Document.create({
      owner: req.user._id,
      chatbot: chatbot._id,
      name: req.file?.originalname || url || 'Text document',
      type,
      sourceUrl: url,
      status: 'pending',
    });

    // Add to chatbot documents array and set status to training
    chatbot.documents.push(doc._id);
    chatbot.status = 'training';
    await chatbot.save();

    // Immediately respond so UI doesn't hang
    res.status(202).json({
      success: true,
      message: 'Document queued for processing',
      document: doc,
    });

    // Process asynchronously (same process, no Redis needed)
    setImmediate(async () => {
      try {
        await Document.findByIdAndUpdate(doc._id, { status: 'processing' });

        // Extract text based on type
        let extracted;
        if (type === 'pdf') {
          if (!req.file?.buffer) throw new Error('No PDF file provided');
          extracted = await extractFromPDF(req.file.buffer);
        } else if (type === 'url') {
          if (!url) throw new Error('No URL provided');
          extracted = await extractFromURL(url);
        } else {
          if (!text) throw new Error('No text provided');
          extracted = extractFromText(text);
        }

        // Embed into Pinecone
        const { chunkCount, vectorIds } = await embedDocument({
          text: extracted.text,
          documentId: doc._id.toString(),
          chatbotId:  chatbot._id.toString(),
          namespace:  chatbot.vectorNamespace,
          metadata: { type, sourceUrl: url || '' },
        });

        // Mark document complete
        await Document.findByIdAndUpdate(doc._id, {
          status: 'completed',
          processedAt: new Date(),
          vectorIds,
          stats: {
            charCount:  extracted.charCount,
            chunkCount,
            pageCount:  extracted.pageCount,
            tokenCount: Math.ceil(extracted.charCount / 4),
          },
        });

        // Set chatbot to ready
        await Chatbot.findByIdAndUpdate(chatbot._id, { status: 'ready' });

        // Update user usage
        await User.findByIdAndUpdate(req.user._id, {
          $inc: {
            'usage.totalDocuments': 1,
            'usage.currentMonth.tokens': Math.ceil(extracted.charCount / 4),
          },
        });

        console.log(`[Doc] Processed doc ${doc._id}: ${chunkCount} chunks embedded`);
      } catch (err) {
        console.error('[Doc] Processing failed:', err.message);
        await Document.findByIdAndUpdate(doc._id, {
          status: 'failed',
          errorMessage: err.message,
        });
        // Only reset to draft if no other completed docs
        const completedDocs = await Document.countDocuments({ chatbot: chatbot._id, status: 'completed' });
        if (completedDocs === 0) {
          await Chatbot.findByIdAndUpdate(chatbot._id, { status: 'error' });
        } else {
          await Chatbot.findByIdAndUpdate(chatbot._id, { status: 'ready' });
        }
      }
    });

  } catch (err) { next(err); }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ chatbot: req.params.chatbotId, owner: req.user._id }).sort('-createdAt');
    res.json({ success: true, documents: docs });
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const chatbot = await Chatbot.findById(doc.chatbot);

    // Remove from Pinecone
    if (doc.vectorIds?.length) {
      await deleteDocumentVectors({ vectorIds: doc.vectorIds, namespace: chatbot?.vectorNamespace });
    }

    await Chatbot.findByIdAndUpdate(doc.chatbot, { $pull: { documents: doc._id } });
    await doc.deleteOne();

    // If no more docs, reset to draft
    const remaining = await Document.countDocuments({ chatbot: doc.chatbot, status: 'completed' });
    if (remaining === 0) {
      await Chatbot.findByIdAndUpdate(doc.chatbot, { status: 'draft' });
    }

    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};

// Poll document status (for training progress)
exports.getDocumentStatus = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, status: doc.status, stats: doc.stats, errorMessage: doc.errorMessage });
  } catch (err) { next(err); }
};
