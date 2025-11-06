import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debug, setDebug] = useState(null)
  const { setToken, setUser } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDebug(null)
    try {
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password })
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.error
      setError(message || `Login failed${status ? ` (HTTP ${status})` : ''}`)
      setDebug({ url: err.config?.url, method: err.config?.method, status, message })
    }
  }

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 0'
    }}>
      <Card style={{ 
        maxWidth: '450px', 
        width: '100%',
        background: 'var(--card-soft)',
        border: '2px solid rgba(168,85,247,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="emoji-large" style={{ marginBottom: '1rem' }}>💜</div>
          <h1 style={{ marginBottom: '0.5rem' }}>
            <span className="emoji">👋</span>
            Welcome Back!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to continue your fitness journey
          </p>
        </div>
        
        <form onSubmit={onSubmit} className="form">
          {error && (
            <div className="error" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <span className="emoji">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          <Input 
            label={<><span className="emoji">📧</span> Email</>} 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            type="email" 
            required 
            placeholder="your.email@example.com"
          />
          <Input 
            label={<><span className="emoji">🔒</span> Password</>} 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            type="password" 
            required 
            placeholder="Enter your password"
          />
          <Button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            <span className="emoji">🚀</span> Sign In
          </Button>
        </form>
        
        {debug && (
          <div className="note" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <div>Request: {debug.method?.toUpperCase()} {debug.url}</div>
            {debug.status && <div>Status: {debug.status}</div>}
            {debug.message && <div>Server: {debug.message}</div>}
          </div>
        )}
        
        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Don't have an account?
          </p>
          <Link 
            to="/register" 
            style={{ 
              color: 'var(--brand)', 
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateX(4px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
          >
            <span className="emoji">✨</span>
            Create Account
          </Link>
        </div>
      </Card>
    </div>
  )
}


