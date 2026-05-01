import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from './Button'

export default function Navbar({ isAuthenticated }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-acid to-violet rounded-xl flex items-center justify-center shadow-lg shadow-acid/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-lg">E</span>
          </div>
          <span className="text-xl font-black text-text tracking-tight hidden sm:block">
            Embed<span className="text-gradient">IQ</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-semibold">
          {!isAuthenticated ? (
            <>
              <Link to="/docs" className="text-sm text-dim hover:text-acid transition-colors">Documentation</Link>
              <Link to="/login" className="text-sm text-dim hover:text-acid transition-colors">Sign in</Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="px-6">Get Started</Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-dim">{user?.email}</span>
              <span className="px-4 py-1.5 rounded-full bg-surface border border-border text-xs font-bold text-muted">
                {user?.plan?.type?.toUpperCase() || 'FREE'}
              </span>
              <button onClick={handleLogout} className="text-muted hover:text-danger transition-colors hover:bg-danger/5 p-2 rounded-xl">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-text">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-surface/50 backdrop-blur-lg">
          <div className="px-6 py-4 space-y-4">
            {!isAuthenticated ? (
              <>
                <Link to="/docs" className="block text-sm text-dim hover:text-text">Docs</Link>
                <Link to="/login" className="block text-sm text-dim hover:text-text">Sign in</Link>
                <Link to="/register" className="btn-primary w-full text-center">Get Started</Link>
              </>
            ) : (
              <>
                <div className="text-sm text-dim mb-2">{user?.email}</div>
                <button onClick={handleLogout} className="w-full text-left text-sm text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors">
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
