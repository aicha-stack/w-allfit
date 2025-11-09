import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL, useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PasswordStrength from '../components/ui/PasswordStrength.jsx'
import Card from '../components/ui/Card.jsx'
import Icon from '../components/ui/Icon.jsx'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState('idle') // idle | registering | logging
  const [debug, setDebug] = useState(null)
  const { setToken, setUser } = useAuth()
  const navigate = useNavigate()
  const [health, setHealth] = useState('checking') // checking | ok | fail

  useEffect(() => {
    console.log("🔍 Register page - API URL check:");
    console.log("  API_URL:", API_URL);
    console.log("  VITE_API_URL from env:", import.meta.env.VITE_API_URL);
    console.log("  Health check URL:", `${API_URL}/api/health`);
    
    fetch(`${API_URL}/api/health`)
      .then(r => {
        console.log("  Health check response status:", r.status);
        return r.ok ? setHealth('ok') : setHealth('fail')
      })
      .catch((err) => {
        console.error("  Health check failed:", err);
        setHealth('fail')
      })
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDebug(null)
    try {
      console.log("🔍 Register attempt:");
      console.log("  API_URL:", API_URL);
      console.log("  Register URL:", `${API_URL}/api/users/register`);
      console.log("  Login URL:", `${API_URL}/api/users/login`);
      
      setStep('registering')
      await axios.post(`${API_URL}/api/users/register`, { name, email, password })
      setStep('logging')
      const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password })
      setToken(data.token)
      setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.error
      setError(message || `Registration failed${status ? ` (HTTP ${status})` : ''}`)
      setDebug({
        url: err.config?.url,
        method: err.config?.method,
        status,
        message,
      })
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
            <Icon name="star" size={64} color="var(--brand)" />
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>
            Join W.ALLfit
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Start your personalized fitness journey today
          </p>
        </div>
        
        {health !== 'ok' && (
          <div className="error" style={{ 
            marginBottom: '1rem',
            padding: '1rem',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Icon name="warning" size={24} color="currentColor" />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Backend Server Not Reachable
                </strong>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Cannot connect to backend at: <code style={{ 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '0.2rem 0.4rem', 
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}>{API_URL}</code>
                  </p>
                  <p style={{ margin: '0.5rem 0', fontWeight: '600' }}>To fix this:</p>
                  <ol style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                    <li style={{ marginBottom: '0.25rem' }}>
                      Make sure the backend server is running:
                      <code style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '0.1rem 0.3rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        marginLeft: '0.5rem'
                      }}>cd backend && npm run dev</code>
                    </li>
                    <li style={{ marginBottom: '0.25rem' }}>
                      Check that <code style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '0.1rem 0.3rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>VITE_API_URL</code> in <code style={{ 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '0.1rem 0.3rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>frontend/.env</code> matches your backend URL
                    </li>
                    <li style={{ marginBottom: '0.25rem' }}>
                      Verify the backend is accessible at the URL above
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            {health === 'checking' && (
              <div style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                Checking connection...
              </div>
            )}
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
            label="Nom complet"
            icon={<Icon name="user" size={18} />}
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
            required 
            placeholder="Votre nom complet"
            validation={(value) => {
              if (!value || value.trim().length < 2) {
                return { valid: false, message: 'Le nom doit contenir au moins 2 caractères' }
              }
              if (value.trim().length > 120) {
                return { valid: false, message: 'Le nom ne peut pas dépasser 120 caractères' }
              }
              return { valid: true, message: 'Nom valide' }
            }}
          />
          <Input 
            label="Email"
            icon={<Icon name="email" size={18} />}
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            type="email" 
            required 
            placeholder="votre.email@exemple.com"
            validation={(value) => {
              if (!value) {
                return { valid: false, message: 'L\'email est requis' }
              }
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
            placeholder="Créez un mot de passe fort"
            showPasswordToggle={true}
            validation={(value) => {
              if (!value) {
                return { valid: false, message: 'Le mot de passe est requis' }
              }
              if (value.length < 8) {
                return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' }
              }
              if (value.length >= 8 && value.length < 12) {
                return { valid: true, message: 'Mot de passe acceptable' }
              }
              const hasUpper = /[A-Z]/.test(value)
              const hasLower = /[a-z]/.test(value)
              const hasNumber = /[0-9]/.test(value)
              const hasSpecial = /[^A-Za-z0-9]/.test(value)
              
              if (hasUpper && hasLower && hasNumber && hasSpecial) {
                return { valid: true, message: 'Mot de passe très fort' }
              }
              return { valid: true, message: 'Mot de passe valide' }
            }}
          />
          {password && <PasswordStrength password={password} />}
          <Button 
            type="submit" 
            disabled={step === 'registering' || step === 'logging'}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {step === 'registering' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="loading" size={18} color="white" />
                Creating Account...
              </span>
            ) : step === 'logging' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="lock" size={18} color="white" />
                Signing In...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="star" size={18} color="white" />
                Create Account
              </span>
            )}
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
            Already have an account?
          </p>
          <Link 
            to="/login" 
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
            <Icon name="user" size={16} color="var(--brand)" />
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  )
}


