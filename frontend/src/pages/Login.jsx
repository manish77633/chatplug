import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import AuthCard from '../components/ui/AuthCard'
import FormInput from '../components/ui/FormInput'
import Button from '../components/ui/Button'
import Navbar from '../components/ui/Navbar'
import toast from 'react-hot-toast'
import { ArrowRight } from 'lucide-react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password is required'
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    return newErrors
  }

  const handle = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar isAuthenticated={false} />
      <AuthCard title="Welcome Back" subtitle="Sign in to your account to continue.">
        <form onSubmit={handle} className="space-y-5 mb-6">
          <FormInput
            type="email"
            placeholder="your@email.com"
            value={form.email}
            error={errors.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
          <FormInput
            type="password"
            placeholder="Password"
            value={form.password}
            error={errors.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          />
          <Button fullWidth variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-surface/80 text-muted">New here?</span>
          </div>
        </div>

        <Link to="/register" className="block">
          <Button fullWidth variant="secondary" size="lg">
            Create Account
          </Button>
        </Link>
      </AuthCard>
    </>
  )
}
