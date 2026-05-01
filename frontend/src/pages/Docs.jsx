import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Upload, Brain, Palette, Code2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your data',
    desc: 'Add PDFs, paste URLs, or write plain text. ChatPlug scrapes and processes your content automatically.',
    code: null,
    tip: 'Tip: You can add multiple sources — ChatPlug merges them into one unified knowledge base.',
  },
  {
    icon: Brain,
    title: 'AI trains in background',
    desc: 'Your documents are split into chunks, embedded using OpenAI, and stored in Pinecone vector DB. Usually takes 1–2 minutes.',
    code: null,
    tip: 'Powered by RAG — your bot only answers from YOUR content, never hallucinating beyond it.',
  },
  {
    icon: Palette,
    title: 'Customize look & feel',
    desc: 'Set the bot name, primary color, welcome message, and system prompt to match your brand.',
    code: `{
  "botName": "Support Assistant",
  "primaryColor": "#6366f1",
  "welcomeMessage": "Hi! How can I help?",
  "temperature": 0.3
}`,
    tip: 'Lower temperature = more factual. Higher = more creative responses.',
  },
  {
    icon: Code2,
    title: 'Embed on any site',
    desc: 'Copy one script tag and paste it before </body>. Works on React, WordPress, Webflow — everything.',
    code: `<script src="https://api.chatplug.com/embed/YOUR_BOT_ID/widget.js"></script>`,
    tip: 'The widget is under 8KB — zero impact on your site performance.',
  },
]

export default function Docs() {
  const [current, setCurrent] = useState(0)
  const step = STEPS[current]

  return (
    <div className="min-h-screen bg-void">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Link to="/" className="text-lg font-display font-bold text-text">Embed<span className="text-acid">IQ</span></Link>
        <Link to="/register" className="btn-primary text-sm">Get Started</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <span className="badge bg-acid/10 text-acid border border-acid/20 mb-4 inline-block">How it works</span>
          <h1 className="text-4xl font-display font-black text-text mb-3">From zero to embedded in 4 steps</h1>
          <p className="text-dim">No ML expertise required. No infrastructure to manage.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`transition-all rounded-full ${i === current ? 'w-8 h-2.5 bg-acid' : i < current ? 'w-2.5 h-2.5 bg-acid/40' : 'w-2.5 h-2.5 bg-border'}`} />
          ))}
        </div>

        {/* Step Card */}
        <AnimatePresence mode="wait">
          <motion.div key={current}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-acid/10 flex items-center justify-center shrink-0">
                <step.icon className="text-acid" size={26} />
              </div>
              <div>
                <p className="text-xs font-mono text-muted mb-1">Step {current + 1} of {STEPS.length}</p>
                <h2 className="text-2xl font-display font-bold text-text mb-2">{step.title}</h2>
                <p className="text-dim leading-relaxed">{step.desc}</p>
              </div>
            </div>

            {step.code && (
              <div className="bg-panel rounded-xl p-5 mb-6 border border-border">
                <pre className="text-sm text-acid font-mono overflow-x-auto whitespace-pre-wrap">{step.code}</pre>
              </div>
            )}

            <div className="bg-acid/5 border border-acid/20 rounded-xl px-5 py-4 mb-8">
              <p className="text-sm text-acid/80">{step.tip}</p>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setCurrent(p => Math.max(0, p - 1))}
                disabled={current === 0}
                className="btn-ghost flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowLeft size={16} /> Previous
              </button>
              {current < STEPS.length - 1 ? (
                <button onClick={() => setCurrent(p => p + 1)} className="btn-primary flex items-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <Link to="/register" className="btn-primary flex items-center gap-2">
                  Start Building <CheckCircle2 size={16} />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* All steps overview */}
        <div className="grid md:grid-cols-4 gap-4 mt-10">
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`card p-5 text-left transition-all hover:border-acid/30 ${i === current ? 'border-acid/40 bg-acid/5' : ''}`}>
              <s.icon className={`mb-3 ${i === current ? 'text-acid' : 'text-muted'}`} size={18} />
              <p className={`text-xs font-mono mb-1 ${i < current ? 'text-acid' : 'text-muted'}`}>
                {i < current ? '✓' : `0${i+1}`}
              </p>
              <p className="text-sm font-medium text-text">{s.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
