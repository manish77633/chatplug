import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Zap, Users, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Analytics() {
  const { id } = useParams()
  const [chatbot, setChatbot]   = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/chatbots/${id}`),
      api.get(`/analytics/chatbot/${id}/sessions`),
    ]).then(([cb, sess]) => {
      setChatbot(cb.data.chatbot)
      setSessions(sess.data.sessions)
    }).catch(() => toast.error('Failed to load analytics'))
    .finally(() => setLoading(false))
  }, [id])

  const stats = chatbot ? [
    { label: 'Total Chats',    value: chatbot.stats?.totalMessages || 0, icon: MessageSquare, color: 'text-acid' },
    { label: 'Total Tokens',   value: (chatbot.stats?.totalTokens || 0).toLocaleString(), icon: Zap, color: 'text-sky' },
    { label: 'Sessions',       value: sessions.length, icon: Users, color: 'text-emerald-400' },
    { label: 'Documents',      value: chatbot.documents?.length || 0, icon: TrendingUp, color: 'text-amber-400' },
  ] : []

  return (
    <div className="min-h-screen bg-void">
      <nav className="flex items-center gap-4 px-8 py-4 border-b border-border">
        <Link to={`/chatbot/${id}`} className="text-muted hover:text-text transition-colors"><ArrowLeft size={18} /></Link>
        <h1 className="font-display font-semibold text-text">{chatbot?.name} — Analytics</h1>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="card p-5">
              <s.icon className={`${s.color} mb-3`} size={20} />
              <p className="text-2xl font-display font-bold text-text">{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sessions Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-text">Recent Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <div className="py-16 text-center text-muted">No chat sessions yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map(s => (
                <div key={s._id} className="px-6 py-4 flex items-center justify-between hover:bg-panel transition-colors">
                  <div>
                    <p className="text-sm text-text font-mono">{s.sessionId}</p>
                    <p className="text-xs text-muted mt-0.5">{s.sourceDomain || 'Unknown domain'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text">{s.stats?.totalMessages || 0} messages</p>
                    <p className="text-xs text-muted">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
