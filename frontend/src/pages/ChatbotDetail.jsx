import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Link as LinkIcon, FileText, CheckCircle2, Loader2,
  Trash2, ArrowLeft, Copy, ExternalLink, RefreshCw, AlertCircle, Clock
} from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STEPS = ['Data Source', 'Training', 'Customize', 'Deploy']

export default function ChatbotDetail() {
  const { id } = useParams()
  const [chatbot, setChatbot]     = useState(null)
  const [step, setStep]           = useState(0)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput]   = useState('')
  const [textInput, setTextInput] = useState('')
  const [uploadType, setUploadType] = useState('pdf')
  const [settings, setSettings]   = useState({})
  const pollRef = useRef(null)

  const fetchChatbot = useCallback(async () => {
    try {
      const { data } = await api.get(`/chatbots/${id}`)
      setChatbot(data.chatbot)
      setSettings(data.chatbot.settings || {})
      if (data.chatbot.documents?.length > 0 && step === 0) setStep(1)
      if (data.chatbot.status === 'ready') setStep(prev => Math.max(prev, 2))
    } catch {
      toast.error('Failed to load chatbot')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchChatbot() }, [fetchChatbot])

  // Auto-poll when training
  useEffect(() => {
    if (chatbot?.status === 'training') {
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/chatbots/${id}`)
          setChatbot(data.chatbot)
          setSettings(data.chatbot.settings || {})
          if (data.chatbot.status === 'ready') {
            clearInterval(pollRef.current)
            setStep(prev => Math.max(prev, 2))
            toast.success('🎉 Training complete! Bot is ready.')
          }
          if (data.chatbot.status === 'error') {
            clearInterval(pollRef.current)
            toast.error('Training failed. Check your document.')
          }
        } catch {}
      }, 3000)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [chatbot?.status, id])

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('type', uploadType)
      if (uploadType === 'pdf') {
        const file = e.target.querySelector('input[type=file]')?.files?.[0]
        if (!file) { toast.error('Select a PDF'); return }
        formData.append('file', file)
      } else if (uploadType === 'url') {
        if (!urlInput.trim()) { toast.error('Enter a URL'); return }
        formData.append('url', urlInput)
      } else {
        if (!textInput.trim()) { toast.error('Enter some text'); return }
        formData.append('text', textInput)
      }
      await api.post(`/documents/${id}/upload`, formData)
      toast.success('Document queued! Training will start shortly…')
      setStep(1)
      setTimeout(fetchChatbot, 500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const deleteDoc = async (docId) => {
    if (!confirm('Remove this document?')) return
    try {
      await api.delete(`/documents/${docId}`)
      toast.success('Document removed')
      fetchChatbot()
    } catch { toast.error('Failed to delete') }
  }

  const saveSettings = async () => {
    try {
      await api.put(`/chatbots/${id}`, { settings, widget: chatbot.widget })
      toast.success('Settings saved!')
      setStep(3)
    } catch { toast.error('Save failed') }
  }

  const embedSnippet = chatbot
    ? `<script src="${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}/embed/${chatbot.embedId}/widget.js"></script>`
    : ''

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <Loader2 className="animate-spin text-acid" size={32} />
    </div>
  )

  const statusColors = {
    completed:  'text-success bg-success/10 border-success/20',
    processing: 'text-warning bg-warning/10 border-warning/20',
    pending:    'text-muted  bg-surface     border-border',
    failed:     'text-danger bg-danger/10   border-danger/20',
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="flex items-center gap-4 px-8 py-4 border-b border-border bg-white sticky top-0 z-10 shadow-sm">
        <Link to="/dashboard" className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-acid to-violet flex items-center justify-center">
          <span className="text-white text-xs font-bold">{chatbot?.name?.[0]?.toUpperCase()}</span>
        </div>
        <h1 className="font-bold text-text">{chatbot?.name}</h1>
        <span className={`badge border ${chatbot?.status === 'ready' ? 'badge-success' : chatbot?.status === 'training' ? 'text-warning bg-warning/10 border-warning/20' : 'badge-secondary'}`}>
          {chatbot?.status === 'training' && <Loader2 size={10} className="animate-spin" />}
          {chatbot?.status === 'ready' && <CheckCircle2 size={10} />}
          {chatbot?.status}
        </span>
        <button onClick={fetchChatbot} className="ml-auto p-2 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step ? 'text-acid' : i < step ? 'text-muted cursor-pointer hover:text-text' : 'text-muted/40 cursor-default'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i === step
                    ? 'bg-acid text-white border-acid shadow-lg shadow-acid/30'
                    : i < step
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-white text-muted/40 border-border'
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className="hidden md:block">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${i < step ? 'bg-success/40' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >

            {/* Step 0 - Data Source */}
            {step === 0 && (
              <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                <h2 className="text-xl font-bold text-text mb-1">Add Data Source</h2>
                <p className="text-dim text-sm mb-8">Upload your content to train the AI on your knowledge.</p>

                {/* Type Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-surface rounded-xl w-fit">
                  {['pdf', 'url', 'text'].map(t => (
                    <button key={t} onClick={() => setUploadType(t)}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        uploadType === t
                          ? 'bg-white text-acid shadow-sm border border-border'
                          : 'text-muted hover:text-text'
                      }`}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  {uploadType === 'pdf' && (
                    <label className="block border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-acid/40 hover:bg-acid/2 transition-all group">
                      <Upload className="mx-auto text-muted mb-3 group-hover:text-acid transition-colors" size={28} />
                      <p className="text-dim text-sm font-medium">Drop PDF here or <span className="text-acid">click to browse</span></p>
                      <p className="text-muted/60 text-xs mt-1">Max 50MB</p>
                      <input type="file" accept=".pdf" className="hidden" />
                    </label>
                  )}
                  {uploadType === 'url' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text">Website URL</label>
                      <input className="input" placeholder="https://example.com/docs"
                        value={urlInput} onChange={e => setUrlInput(e.target.value)} />
                    </div>
                  )}
                  {uploadType === 'text' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text">Paste Content</label>
                      <textarea className="input min-h-[180px] resize-none" placeholder="Paste your knowledge base content here…"
                        value={textInput} onChange={e => setTextInput(e.target.value)} />
                    </div>
                  )}
                  <button type="submit" className="btn-primary w-full py-3" disabled={uploading}>
                    {uploading
                      ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                      : <><Upload size={16} /> Upload & Train</>
                    }
                  </button>
                </form>

                {/* Existing docs */}
                {chatbot?.documents?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-text mb-4">Existing Documents ({chatbot.documents.length})</h3>
                    <div className="space-y-2">
                      {chatbot.documents.map(doc => (
                        <div key={doc._id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText size={16} className="text-acid shrink-0" />
                            <span className="text-sm text-text font-medium truncate">{doc.name}</span>
                            <span className={`badge border text-xs shrink-0 ${statusColors[doc.status] || statusColors.pending}`}>
                              {doc.status === 'processing' && <Loader2 size={10} className="animate-spin" />}
                              {doc.status}
                            </span>
                          </div>
                          <button onClick={() => deleteDoc(doc._id)} className="p-2 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10 ml-2 shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setStep(1)} className="btn-primary mt-4">
                      View Training Status →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 1 - Training Status */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-border p-8 shadow-sm text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  chatbot?.status === 'ready' ? 'bg-success/10' : chatbot?.status === 'error' ? 'bg-danger/10' : 'bg-acid/10'
                }`}>
                  {chatbot?.status === 'ready' && <CheckCircle2 className="text-success" size={36} />}
                  {chatbot?.status === 'error' && <AlertCircle className="text-danger" size={36} />}
                  {(chatbot?.status === 'training' || chatbot?.status === 'draft') &&
                    <Loader2 className="text-acid animate-spin" size={36} />
                  }
                </div>

                <h2 className="text-2xl font-bold text-text mb-2">
                  {chatbot?.status === 'ready' && 'Training Complete!'}
                  {chatbot?.status === 'error' && 'Training Failed'}
                  {chatbot?.status === 'training' && 'Training in Progress…'}
                  {chatbot?.status === 'draft' && 'Waiting for Documents'}
                </h2>
                <p className="text-dim mb-8 max-w-md mx-auto">
                  {chatbot?.status === 'ready' && 'Your chatbot has been trained and is ready to answer questions.'}
                  {chatbot?.status === 'error' && 'Something went wrong while processing your document. Please try uploading again.'}
                  {chatbot?.status === 'training' && 'Documents are being chunked and embedded into the vector database. This takes 1–3 minutes depending on document size.'}
                  {chatbot?.status === 'draft' && 'Go back to the Data Source step and upload a document to begin training.'}
                </p>

                {chatbot?.status === 'training' && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted mb-8">
                    <Clock size={14} />
                    <span>Auto-refreshing every 3 seconds…</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                  {[
                    ['Documents', chatbot?.documents?.length || 0],
                    ['Status', chatbot?.status],
                    ['Engine', 'Gemini'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-surface rounded-xl p-4 border border-border">
                      <p className="text-xs text-muted mb-1 font-medium">{k}</p>
                      <p className="text-sm font-bold text-text capitalize">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <button onClick={fetchChatbot} className="btn-ghost flex items-center gap-2">
                    <RefreshCw size={14} /> Refresh
                  </button>
                  {chatbot?.status === 'ready' && (
                    <button onClick={() => setStep(2)} className="btn-primary">
                      Customize Bot →
                    </button>
                  )}
                  {chatbot?.status === 'error' && (
                    <button onClick={() => setStep(0)} className="btn-primary">
                      ← Try Again
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 - Customize */}
            {step === 2 && (
              <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                <h2 className="text-xl font-bold text-text mb-1">Customize Your Bot</h2>
                <p className="text-dim text-sm mb-8">Adjust the AI's personality and response behavior.</p>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-text mb-2 block">System Prompt</label>
                    <textarea className="input min-h-[120px] resize-none text-sm font-mono"
                      value={settings.systemPrompt || ''}
                      onChange={e => setSettings(p => ({ ...p, systemPrompt: e.target.value }))} />
                    <p className="text-xs text-muted mt-1">Defines the AI's role and personality</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text mb-2 block">Fallback Message</label>
                    <input className="input text-sm" value={settings.fallbackMessage || ''}
                      onChange={e => setSettings(p => ({ ...p, fallbackMessage: e.target.value }))} />
                    <p className="text-xs text-muted mt-1">Shown when the bot doesn't have relevant context</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text mb-3 block">
                      Temperature <span className="font-normal text-muted">({settings.temperature ?? 0.3})</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" className="w-full accent-acid"
                      value={settings.temperature ?? 0.3}
                      onChange={e => setSettings(p => ({ ...p, temperature: parseFloat(e.target.value) }))} />
                    <div className="flex justify-between text-xs text-muted mt-1">
                      <span>🎯 Precise</span>
                      <span>🎨 Creative</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={saveSettings} className="btn-primary">Save & Continue →</button>
                  <Link to={`/chatbot/${id}/playground`} className="btn-ghost flex items-center gap-2">
                    <ExternalLink size={14} /> Test Now
                  </Link>
                </div>
              </div>
            )}

            {/* Step 3 - Deploy */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="text-success" size={24} />
                  <h2 className="text-xl font-bold text-text">Your Bot is Live!</h2>
                </div>
                <p className="text-dim text-sm mb-8">Add this snippet to any website to embed your chatbot.</p>

                <div className="bg-slate-900 rounded-2xl p-5 mb-4 relative group">
                  <pre className="text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">{embedSnippet}</pre>
                  <button
                    onClick={() => { navigator.clipboard.writeText(embedSnippet); toast.success('Copied to clipboard!') }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-xs text-muted mb-8">Paste this before the closing <code className="font-mono bg-surface px-1 rounded">&lt;/body&gt;</code> tag of your site.</p>

                <div className="flex gap-3 flex-wrap">
                  <Link to={`/chatbot/${id}/playground`} className="btn-primary flex items-center gap-2">
                    Test in Playground <ExternalLink size={14} />
                  </Link>
                  <Link to={`/chatbot/${id}/analytics`} className="btn-ghost">View Analytics</Link>
                  <button onClick={() => setStep(2)} className="btn-ghost">← Edit Settings</button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
