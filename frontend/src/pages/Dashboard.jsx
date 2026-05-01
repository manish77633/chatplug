import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Bot, Trash2, Play, BarChart3, Settings, Zap, Calendar } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import Navbar from '../components/ui/Navbar'
import Button from '../components/ui/Button'
import FormInput from '../components/ui/FormInput'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [chatbots, setChatbots] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNameError, setNewNameError] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchChatbots() }, [])

  const fetchChatbots = async () => {
    try {
      const { data } = await api.get('/chatbots')
      setChatbots(data.chatbots)
    } catch { toast.error('Failed to load chatbots') }
    finally { setLoading(false) }
  }

  const createChatbot = async (e) => {
    e.preventDefault()
    if (!newName.trim()) {
      setNewNameError('Bot name is required')
      return
    }
    setNewNameError('')
    setCreating(true)
    try {
      const { data } = await api.post('/chatbots', { name: newName, description: '' })
      setChatbots(p => [data.chatbot, ...p])
      setNewName('')
      setShowModal(false)
      toast.success('Chatbot created! 🎉')
      navigate(`/chatbot/${data.chatbot._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create')
    } finally { setCreating(false) }
  }

  const deleteChatbot = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure? This action cannot be undone.')) return
    try {
      await api.delete(`/chatbots/${id}`)
      setChatbots(p => p.filter(c => c._id !== id))
      toast.success('Chatbot deleted')
    } catch { toast.error('Delete failed') }
  }

  const statusColor = {
    ready: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', dot: 'bg-success', label: 'Live' },
    training: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning', dot: 'bg-warning', label: 'Training' },
    error: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger', label: 'Error' },
    draft: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Draft' },
  }

  return (
    <div className="min-h-screen bg-white bg-grid relative selection:bg-acid/10 selection:text-acid">
      <Navbar isAuthenticated={true} />

      <div className="relative z-10 container-md pt-32 pb-20">
        {/* Header Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-text tracking-tight">Dashboard</h1>
              <p className="text-xl text-dim font-medium">Welcome back, {user?.email?.split('@')[0]}</p>
            </div>
            <Button variant="primary" size="lg" className="shadow-xl shadow-acid/20 h-14 px-8" onClick={() => setShowModal(true)}>
              <Plus size={20} /> Create Chatbot
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Bots', val: chatbots.length, icon: Bot, color: 'text-acid' },
              { label: 'Knowledge Docs', val: chatbots.reduce((s, b) => s + (b.documents?.length || 0), 0), icon: Zap, color: 'text-violet' },
              { label: 'Conversations', val: chatbots.reduce((s, b) => s + (b.stats?.totalMessages || 0), 0), icon: BarChart3, color: 'text-sky' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-8 group flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-dim uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-text">{stat.val}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-surface flex items-center justify-center border border-border group-hover:border-acid/20 transition-all ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Chatbots Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black text-text tracking-tight flex items-center gap-3">
            Your Knowledge Bases
            <span className="h-px flex-1 bg-border/60" />
          </h2>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="card h-72 animate-pulse bg-surface" />
              ))}
            </div>
          ) : chatbots.length === 0 ? (
            <motion.div
              className="card p-20 text-center bg-surface/50 border-dashed border-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 bg-white rounded-3xl border border-border flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Bot className="text-acid" size={40} />
              </div>
              <h3 className="text-3xl font-black text-text mb-4">No chatbots yet</h3>
              <p className="text-xl text-dim mb-10 max-w-md mx-auto">Build your first AI brain today. It only takes a few documents to get started.</p>
              <Button variant="primary" size="lg" className="h-14 px-10" onClick={() => setShowModal(true)}>
                <Plus size={20} /> Build My First Bot
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {chatbots.map((bot, i) => {
                const colors = statusColor[bot.status] || statusColor.draft
                return (
                  <motion.div
                    key={bot._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/chatbot/${bot._id}`} className="block h-full">
                      <div className="card card-hover p-8 h-full flex flex-col group">
                        <div className="flex items-start justify-between mb-8">
                          <div className="w-14 h-14 bg-white border border-border rounded-2xl flex items-center justify-center shadow-sm group-hover:border-acid/30 group-hover:shadow-md transition-all">
                            <Bot className="text-acid" size={28} />
                          </div>
                          <div className={`px-3 py-1 rounded-full border ${colors.bg} ${colors.border} flex items-center gap-2`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>{colors.label}</span>
                          </div>
                        </div>

                        <div className="flex-1 mb-8">
                          <h3 className="text-2xl font-black text-text mb-3 group-hover:text-acid transition-colors line-clamp-1 italic">
                            {bot.name}
                          </h3>
                          <p className="text-dim text-sm font-medium line-clamp-2 leading-relaxed">
                            {bot.description || 'Custom trained AI knowledge base ready for deployment.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-border/60">
                          <div>
                            <p className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">Knowledge</p>
                            <p className="text-lg font-bold text-text">{bot.documents?.length || 0} Docs</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">Activity</p>
                            <p className="text-lg font-bold text-text">{bot.stats?.totalMessages || 0} Msg</p>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-auto">
                          <Link to={`/chatbot/${bot._id}/playground`} className="flex-1" onClick={e => e.stopPropagation()}>
                            <Button variant="secondary" size="sm" className="w-full h-11 text-xs">
                              <Play size={14} className="text-acid" /> Test Lab
                            </Button>
                          </Link>
                          <button
                            onClick={(e) => deleteChatbot(bot._id, e)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl border border-border text-dim hover:text-danger hover:border-danger/30 hover:bg-danger/5 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border border-border rounded-3xl p-10 w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-acid/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Bot className="text-acid" size={32} />
                </div>
                <h3 className="text-4xl font-black text-text tracking-tight mb-2">New Chatbot</h3>
                <p className="text-xl text-dim font-medium">Give your AI brain a name</p>
              </div>

              <form onSubmit={createChatbot} className="space-y-6">
                <div className="space-y-2">
                  <FormInput
                    placeholder="e.g. Sales Assistant, Product Guide"
                    className="h-16 text-lg px-6 font-medium"
                    value={newName}
                    error={newNameError}
                    onChange={e => {
                      setNewName(e.target.value)
                      setNewNameError('')
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="flex-1 h-14"
                    onClick={() => {
                      setShowModal(false)
                      setNewName('')
                      setNewNameError('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1 h-14 shadow-xl shadow-acid/20"
                    disabled={creating}
                  >
                    {creating ? 'Building...' : 'Create Bot'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
