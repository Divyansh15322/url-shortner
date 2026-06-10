import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Scissors, LayoutDashboard, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-ink/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-white hover:text-violet-300 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <Scissors size={14} />
          </div>
          snip
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`btn-ghost text-sm py-1.5 ${location.pathname === '/dashboard' ? 'text-white bg-white/5' : ''}`}
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <div className="w-px h-5 bg-border mx-1" />
              <span className="text-xs text-muted hidden sm:block">{user.username}</span>
              <button onClick={handleLogout} className="btn-ghost text-sm py-1.5 text-muted">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm py-1.5">
                <LogIn size={15} />
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
