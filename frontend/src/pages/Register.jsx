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

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const newErrors = {}
    if (!form.name) newErrors.name = 'Full name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      await register(form.name, form.email, form.password)
      toast.success('Account created! 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <>
      <Navbar isAuthenticated={false} />
      <AuthCard title="Create Account" subtitle="Join thousands using ChatPlug to power their chatbots.">
        <form onSubmit={handle} className="space-y-4 mb-6">
          <FormInput
            placeholder="Full name"
            value={form.name}
            error={errors.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          />
          <FormInput
            type="email"
            placeholder="your@email.com"
            value={form.email}
            error={errors.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
          <FormInput
            type="password"
            placeholder="Password (min 6 characters)"
            value={form.password}
            error={errors.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          />
          <FormInput
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            error={errors.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
          />
          <Button fullWidth variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/30"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-surface/80 text-muted">Already a member?</span>
          </div>
        </div>

        <Link to="/login" className="block">
          <Button fullWidth variant="secondary" size="lg">
            Sign In
          </Button>
        </Link>
      </AuthCard>
    </>
  )
}
