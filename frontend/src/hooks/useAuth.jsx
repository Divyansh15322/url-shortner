import { createContext, useContext, useState, useEffect } from 'react'
import { auth as authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('snip_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('snip_token', data.access_token)
    localStorage.setItem('snip_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (email, username, password) => {
    const { data } = await authAPI.register({ email, username, password })
    localStorage.setItem('snip_token', data.access_token)
    localStorage.setItem('snip_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('snip_token')
    localStorage.removeItem('snip_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
