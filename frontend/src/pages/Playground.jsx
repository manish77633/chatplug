import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, Bot, User, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Playground() {
  const { id } = useParams()
  const [chatbot, setChatbot]   = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [botLoading, setBotLoading]   = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const sessionId = useRef(`playground_${Date.now()}`)
  const abortRef  = useRef(null)

  const loadChatbot = useCallback(async () => {
    try {
      const { data } = await api.get(`/chatbots/${id}`)
      setChatbot(data.chatbot)
      setMessages([{
        role: 'assistant',
        content: data.chatbot.widget?.welcomeMessage || `Hi! I'm ${data.chatbot.name}. How can I help?`,
      }])
      setError(null)
    } catch {
      setError('Failed to load chatbot')
    } finally {
      setPageLoading(false)
    }
  }, [id])

  useEffect(() => { loadChatbot() }, [loadChatbot])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || botLoading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', content: userMsg }])
    setBotLoading(true)

    // Add placeholder bot message
    setMessages(p => [...p, { role: 'assistant', content: '' }])

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const stored  = JSON.parse(localStorage.getItem('chatplug-auth') || '{}')
      const token   = stored?.state?.token

      const controller = new AbortController()
      abortRef.current = controller

      const res = await fetch(`${apiBase}/chat/${chatbot.embedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userMsg,
          sessionId: sessionId.current,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `HTTP ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          try {
            const data = JSON.parse(line.slice(5).trim())
            if (data.delta) {
              full += data.delta
              setMessages(p => {
                const copy = [...p]
                copy[copy.length - 1] = { role: 'assistant', content: full }
                return copy
              })
            }
          } catch {}
        }
      }

      if (!full) {
        setMessages(p => {
          const copy = [...p]
          copy[copy.length - 1] = { role: 'assistant', content: 'Sorry, I could not generate a response.' }
          return copy
        })
      }

    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('[Chat]', err)
      setMessages(p => {
        const copy = [...p]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
        }
        return copy
      })
    } finally {
      setBotLoading(false)
      abortRef.current = null
    }
  }

  if (pageLoading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <Loader2 className="animate-spin text-acid" size={32} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle className="mx-auto text-danger" size={40} />
        <p className="text-dim">{error}</p>
        <button onClick={loadChatbot} className="btn-ghost flex items-center gap-2 mx-auto">
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </div>
  )

  const isReady = chatbot?.status === 'ready'

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Nav */}
      <nav className="flex items-center gap-4 px-6 py-4 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link to={`/chatbot/${id}`} className="text-muted hover:text-text transition-colors p-2 rounded-lg hover:bg-surface">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-acid to-violet flex items-center justify-center">
          <Bot className="text-white" size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-text text-sm truncate">{chatbot?.name} — Playground</h1>
          <p className="text-xs text-muted">Testing environment</p>
        </div>
        <span className={`badge ${isReady ? 'badge-success' : 'badge-secondary'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-success animate-pulse' : 'bg-warning animate-pulse'}`} />
          {chatbot?.status}
        </span>
      </nav>

      {/* Not ready banner */}
      {!isReady && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-3 flex items-center gap-3">
          <Loader2 size={14} className="text-warning animate-spin shrink-0" />
          <p className="text-sm text-warning font-medium">
            Bot is still {chatbot?.status === 'training' ? 'training on your documents' : 'in draft mode'}.
            {chatbot?.status === 'draft' && ' Add documents to start training.'}
          </p>
          {chatbot?.status === 'training' && (
            <button onClick={loadChatbot} className="ml-auto text-xs text-warning hover:text-warning/80 flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-acid to-violet'
                    : 'bg-white border border-border shadow-sm'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className="text-white" />
                    : <Bot size={14} className="text-acid" />
                  }
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-acid to-violet text-white rounded-tr-sm'
                    : 'bg-white border border-border text-text rounded-tl-sm'
                }`}>
                  {msg.content || (botLoading && i === messages.length - 1
                    ? <span className="flex gap-1 py-1">
                        {[0, 1, 2].map(j => (
                          <span key={j} className="w-2 h-2 bg-muted/50 rounded-full animate-bounce"
                            style={{ animationDelay: `${j * 0.15}s` }} />
                        ))}
                      </span>
                    : null
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 bg-white/80 backdrop-blur-sm">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3">
          <input
            className="input flex-1"
            placeholder={isReady ? 'Type a message to test your bot…' : 'Bot is not ready yet…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={botLoading}
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary px-4 py-3 aspect-square"
            disabled={!input.trim() || botLoading}
          >
            {botLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  )
}
