require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [process.env.CLIENT_ORIGIN, 'http://localhost:5173'].filter(Boolean);
    if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== 'production') cb(null, true);
    else cb(new Error('CORS blocked'));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/chatbots',  require('./routes/chatbots'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/webhooks',  require('./routes/webhooks'));
app.use('/api/analytics', require('./routes/analytics'));

// ─── Embed Script (Vanilla JS - ultra light) ──────────────────────────────────
app.get('/embed/:botId/widget.js', require('./controllers/embedController').serveWidget);

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('[GlobalError]', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 ChatPlug API on :${PORT}`));
  })
  .catch(err => { console.error('FATAL:', err.message); process.exit(1); });

process.on('SIGTERM', async () => { await mongoose.connection.close(); process.exit(0); });
module.exports = app;
