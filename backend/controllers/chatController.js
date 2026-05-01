const { GoogleGenerativeAI } = require('@google/generative-ai');
const { queryEmbeddings } = require('../services/embeddingService');
const Chatbot     = require('../models/Chatbot');
const ChatSession = require('../models/ChatSession');
const User        = require('../models/User');
const jwt         = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.chat = async (req, res, next) => {
  try {
    const { embedId } = req.params;
    const { message, sessionId = uuidv4(), history = [] } = req.body;

    // Try to identify if the caller is the owner (playground mode)
    let isOwner = false;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        isOwner = !!decoded?.id;
      }
    } catch {}

    // Get chatbot config - owners can test even if not ready/public
    let chatbot;
    if (isOwner) {
      chatbot = await Chatbot.findOne({ embedId });
    } else {
      chatbot = await Chatbot.findOne({ embedId, isPublic: true, status: 'ready' });
    }

    if (!chatbot) {
      return res.status(404).json({ success: false, message: 'Bot not found or not ready' });
    }

    // RAG: Get relevant context from Pinecone
    let context = 'No relevant context found.';
    try {
      const relevantChunks = await queryEmbeddings({
        query: message,
        namespace: chatbot.vectorNamespace,
        topK: 5,
      });
      if (relevantChunks.length > 0) {
        context = relevantChunks.map(c => c.text).join('\n\n---\n\n');
      }
    } catch (e) {
      console.warn('[RAG] Could not query embeddings:', e.message);
    }

    // Build prompt
    const systemPrompt = `${chatbot.settings.systemPrompt}

Context from knowledge base:
${context}

Rules:
- Answer ONLY based on the context above
- If context is insufficient, say: "${chatbot.settings.fallbackMessage}"
- Be concise and helpful`;

    // Build Gemini chat history with strict alternating roles
    let geminiHistory = [];
    let lastRole = null;
    
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      if (role === lastRole && geminiHistory.length > 0) {
        geminiHistory[geminiHistory.length - 1].parts[0].text += '\n' + msg.content;
      } else {
        geminiHistory.push({ role, parts: [{ text: msg.content }] });
        lastRole = role;
      }
    }

    // Ensure the first message is 'user' (Gemini requirement)
    if (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
    }

    // Stream response via SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({ history: geminiHistory });
    const streamResult = await chat.sendMessageStream(message);

    let fullResponse = '';

    for await (const chunk of streamResult.stream) {
      const delta = chunk.text();
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Save session async (don't block response)
    setImmediate(async () => {
      try {
        const totalTokens = Math.ceil((message.length + fullResponse.length) / 4);
        await ChatSession.findOneAndUpdate(
          { sessionId },
          {
            $setOnInsert: { chatbot: chatbot._id, sessionId, sourceDomain: req.headers.referer },
            $push: {
              messages: [
                { role: 'user',      content: message,      tokens: Math.ceil(message.length / 4) },
                { role: 'assistant', content: fullResponse,  tokens: Math.ceil(fullResponse.length / 4) },
              ],
            },
            $inc: { 'stats.totalMessages': 2, 'stats.totalTokens': totalTokens },
          },
          { upsert: true, new: true }
        );
        await Chatbot.findByIdAndUpdate(chatbot._id, {
          $inc: { 'stats.totalMessages': 2, 'stats.totalTokens': totalTokens },
        });
        await User.findByIdAndUpdate(chatbot.owner, {
          $inc: { 'usage.totalMessages': 1, 'usage.currentMonth.tokens': totalTokens },
        });
      } catch (e) { console.error('[ChatSave]', e.message); }
    });

  } catch (err) { next(err); }
};
