import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  // Setup axios interceptor to handle 401/403 errors
  useEffect(() => {
    let isMounted = true
    
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Token is invalid or expired
          if (isMounted) {
            console.warn('Authentication error (401/403), clearing token and redirecting to login')
            setToken('')
            setUser(null)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Only redirect if we're not already on login/register page
            const currentPath = window.location.pathname
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
              // Use setTimeout to avoid state update during render
              setTimeout(() => {
                window.location.href = '/login'
              }, 100)
            }
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      isMounted = false
      axios.interceptors.response.eject(interceptor)
    }
  }, [setToken, setUser])

  const value = useMemo(() => ({ token, setToken, user, setUser }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function apiHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


