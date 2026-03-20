import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('vb_token'))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('vb_user')
    return u ? JSON.parse(u) : null
  })

  const login = (accessToken, userData) => {
    localStorage.setItem('vb_token', accessToken)
    localStorage.setItem('vb_user', JSON.stringify(userData))
    setToken(accessToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('vb_token')
    localStorage.removeItem('vb_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
