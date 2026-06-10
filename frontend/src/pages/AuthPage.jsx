import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Scissors, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', username: '', password: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) return toast.error('Fill in all fields')
    if (!isLogin && !form.username) return toast.error('Username required')
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
        toast.success('Welcome back!')
      } else {
        await register(form.email, form.username, form.password)
        toast.success('Account created!')
      }
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 font-display font-bold text-xl text-white">
            <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center">
              <Scissors size={18} />
            </div>
            snip
          </Link>
        </div>

        <div className="card p-7 shadow-2xl shadow-black/50">
          <h2 className="font-display text-xl font-semibold text-white mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-muted mb-6">
            {isLogin ? 'Sign in to access your links and analytics.' : 'Start shortening links in seconds.'}
          </p>

          <div className="space-y-3">
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input-field pl-10"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={set('email')}
                onKeyDown={handleKeyDown}
              />
            </div>

            {!isLogin && (
              <div className="relative animate-fade-up">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="input-field pl-10"
                  placeholder="Username"
                  value={form.username}
                  onChange={set('username')}
                  onKeyDown={handleKeyDown}
                />
              </div>
            )}

            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="input-field pl-10 pr-11"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={set('password')}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-zinc-300 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            className="btn-primary w-full justify-center mt-5"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isLogin ? 'Sign in' : 'Create account'}
          </button>

          <p className="text-center text-sm text-muted mt-5">
            {isLogin ? "Don't have an account?" : 'Already have one?'}{' '}
            <button
              className="text-violet-400 hover:text-violet-300 transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
