import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import Icon from '../components/ui/Icon.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debug, setDebug] = useState(null)
  const [health, setHealth] = useState('checking') // checking | ok | fail
  const { setToken, setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then(r => r.ok ? setHealth('ok') : setHealth('fail'))
      .catch(() => setHealth('fail'))
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDebug(null)
    try {
      console.log("🔍 Login attempt:");
      console.log("  API_URL:", API_URL);
      console.log("  Login URL:", `${API_URL}/api/users/login`);
      console.log("  Email:", email);
      
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
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Icon name="heart" size={64} color="var(--brand)" />
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>
            Welcome Back!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Sign in to continue your fitness journey
          </p>
        </div>
        
        {health !== 'ok' && (
          <div className="error" style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Icon name="warning" size={24} color="currentColor" />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Backend Server Not Reachable
                </strong>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Cannot connect to: <code style={{ 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '0.2rem 0.4rem', 
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}>{API_URL}</code>
                  </p>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.85rem' }}>
                    Make sure the backend is running and <code style={{ 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '0.1rem 0.3rem', 
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>VITE_API_URL</code> is correct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={onSubmit} className="form">
          {error && (
            <div className="error" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <Icon name="warning" size={18} color="currentColor" />
              <span>{error}</span>
            </div>
          )}
          <Input 
            label="Email"
            icon={<Icon name="email" size={18} />}
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            type="email" 
            required 
            placeholder="votre.email@exemple.com"
            error={error && error.toLowerCase().includes('email') ? error : null}
            validation={(value) => {
              if (!value) return null
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(value)) {
                return { valid: false, message: 'Format d\'email invalide' }
              }
              return { valid: true, message: 'Email valide' }
            }}
          />
          <Input 
            label="Mot de passe"
            icon={<Icon name="lock" size={18} />}
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            type="password" 
            required 
            placeholder="Entrez votre mot de passe"
            showPasswordToggle={true}
            error={error && error.toLowerCase().includes('password') ? error : null}
          />
          <Button type="submit" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Icon name="star" size={18} color="white" />
            Sign In
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
            <Icon name="star" size={16} color="var(--brand)" />
            Create Account
          </Link>
        </div>
      </Card>
    </div>
  )
}


