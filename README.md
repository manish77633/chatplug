# ChatPlug — AI Chatbot Embeddable Platform

Train a chatbot on your documents and embed it on any website with one script tag.

## Tech Stack

**Backend:** Node.js · Express · MongoDB · Pinecone · LangChain · BullMQ · Redis  
**Frontend:** React (Vite) · Tailwind CSS · Framer Motion · Zustand · Lucide

---

## Project Structure

```
chatplug/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatbotController.js
│   │   ├── chatController.js      # RAG pipeline + streaming
│   │   ├── documentController.js  # Upload + BullMQ queue
│   │   └── embedController.js     # Vanilla JS widget server
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + plan limits
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Chatbot.js
│   │   ├── Document.js
│   │   └── ChatSession.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chatbots.js
│   │   ├── documents.js
│   │   ├── chat.js
│   │   ├── admin.js
│   │   ├── analytics.js
│   │   └── webhooks.js
│   ├── services/
│   │   ├── embeddingService.js    # Pinecone vector ops
│   │   └── documentService.js    # PDF/URL/text extraction
│   └── jobs/
│       ├── embeddingQueue.js      # BullMQ queue setup
│       └── worker.js              # Background processor
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── store/
        │   └── authStore.js       # Zustand auth
        ├── utils/
        │   └── api.js             # Axios instance
        └── pages/
            ├── Landing.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── ChatbotDetail.jsx  # 4-step stepper UI
            ├── Playground.jsx     # Real-time streaming chat
            ├── Analytics.jsx
            ├── Docs.jsx           # Interactive how-to guide
            └── AdminPanel.jsx
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Pinecone account (free)
- Redis (local or Upstash)
- OpenAI API key

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in all values in .env
npm run dev
```

### 2. Start Worker (separate terminal)

```bash
cd backend
npm run worker
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Min 32 char secret |
| `OPENAI_API_KEY` | From platform.openai.com |
| `PINECONE_API_KEY` | From pinecone.io |
| `PINECONE_INDEX` | Your Pinecone index name |
| `REDIS_URL` | Redis connection URL |
| `CLIENT_ORIGIN` | Frontend URL for CORS |

---

## Key Features

- **Multi-tenant** — each user gets isolated chatbots with separate Pinecone namespaces
- **RAG Pipeline** — Pinecone vector search + OpenAI for accurate answers
- **Background Jobs** — BullMQ + Redis for async document processing (no request timeouts)
- **Streaming** — SSE streaming for real-time chat responses
- **Vanilla JS Widget** — ultra-light embed script, works on any site
- **Admin Dashboard** — manage users, view stats, update plans
- **Rate Limiting** — per-route limits to prevent abuse

---

## Deployment

### Backend → Railway
1. Push to GitHub
2. Connect Railway → select backend folder
3. Add all environment variables
4. Add Redis plugin in Railway
5. Deploy — Railway auto-detects Node.js

### Frontend → Vercel
1. Connect Vercel → select frontend folder
2. Set `VITE_API_URL` to Railway backend URL
3. Deploy

### Worker
Run `npm run worker` as a separate Railway service pointing to the same repo.
