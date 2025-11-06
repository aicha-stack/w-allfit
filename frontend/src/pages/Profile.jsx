import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'

export default function Profile() {
  const { token, user, setUser } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/users/profile`, { headers: apiHeaders(token) })
        .then(({ data }) => {
          setName(data.name || '')
          setEmail(data.email || '')
          setUser(data)
        })
        .catch(err => setError(err.response?.data?.error || 'Failed to load profile'))
        .finally(() => setLoading(false))
    }
  }, [token, setUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const { data } = await axios.put(`${API_URL}/api/users/profile`, 
        { name, email },
        { headers: apiHeaders(token) }
      )
      setUser(data)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="note">Loading profile...</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className="emoji-large" style={{ marginBottom: '1rem' }}>👤</div>
        <h1 style={{ marginBottom: '0.5rem' }}>
          <span className="emoji">⚙️</span>
          My Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your account information and settings
        </p>
      </div>
      
      <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span className="emoji">📋</span>
          Account Information
        </h3>
        
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
        
        {success && (
          <div style={{ 
            color: 'var(--success)', 
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(125,211,160,0.15)',
            border: '1px solid rgba(125,211,160,0.3)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span className="emoji">✅</span>
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form">
          <Input 
            label={<><span className="emoji">👤</span> Name</>} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Your full name"
          />
          <Input 
            label={<><span className="emoji">📧</span> Email</>} 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="your.email@example.com"
          />
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: 'var(--card-soft)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span className="emoji">🎭</span>
              <span style={{ fontWeight: '600' }}>Role:</span>
              <span style={{ 
                padding: '0.25rem 0.75rem',
                background: user?.role === 'admin' ? 'var(--gradient-purple)' : 'rgba(168,85,247,0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {user?.role || 'user'}
              </span>
            </div>
            {user?.created_at && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'var(--text-secondary)'
              }}>
                <span className="emoji">📅</span>
                <span style={{ fontSize: '0.9rem' }}>
                  Member since: <strong>{new Date(user.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</strong>
                </span>
              </div>
            )}
          </div>
          
          <Button type="submit" disabled={saving} style={{ width: '100%', marginTop: '1.5rem' }}>
            {saving ? (
              <>⏳ Saving...</>
            ) : (
              <>💾 Update Profile</>
            )}
          </Button>
        </form>
      </Card>
    </div>
  )
}

