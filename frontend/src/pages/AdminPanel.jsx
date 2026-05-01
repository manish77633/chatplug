import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Bot, MessageSquare, Zap, Trash2, Shield } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/users')])
      .then(([s, u]) => { setStats(s.data.stats); setUsers(u.data.users) })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const updatePlan = async (userId, plan) => {
    try {
      await api.patch(`/admin/users/${userId}/plan`, { plan })
      setUsers(p => p.map(u => u._id === userId ? { ...u, plan: { ...u.plan, type: plan } } : u))
      toast.success('Plan updated')
    } catch { toast.error('Failed') }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(p => p.filter(u => u._id !== userId))
      toast.success('User deleted')
    } catch { toast.error('Failed') }
  }

  const statCards = stats ? [
    { label: 'Total Users',    value: stats.users,    icon: Users,         color: 'text-acid' },
    { label: 'Total Chatbots', value: stats.chatbots, icon: Bot,           color: 'text-sky' },
    { label: 'Chat Sessions',  value: stats.sessions, icon: MessageSquare, color: 'text-emerald-400' },
    { label: 'Tokens Used',    value: (stats.totalTokens || 0).toLocaleString(), icon: Zap, color: 'text-amber-400' },
  ] : []

  return (
    <div className="min-h-screen bg-void">
      <nav className="flex items-center gap-4 px-8 py-4 border-b border-border">
        <Link to="/dashboard" className="text-muted hover:text-text transition-colors"><ArrowLeft size={18} /></Link>
        <Shield className="text-acid" size={20} />
        <h1 className="font-display font-semibold text-text">Admin Panel</h1>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map((s, i) => (
            <div key={i} className="card p-5">
              <s.icon className={`${s.color} mb-3`} size={20} />
              <p className="text-2xl font-display font-bold text-text">{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-text">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Email', 'Plan', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs text-muted font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-panel transition-colors">
                    <td className="px-6 py-4 text-text font-medium">{u.name}</td>
                    <td className="px-6 py-4 text-dim font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      <select value={u.plan?.type || 'free'}
                        onChange={e => updatePlan(u._id, e.target.value)}
                        className="bg-panel border border-border rounded-lg px-2 py-1 text-xs text-text focus:outline-none focus:border-acid/50">
                        <option value="free">free</option>
                        <option value="pro">pro</option>
                        <option value="enterprise">enterprise</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => deleteUser(u._id)} className="text-muted hover:text-danger transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
