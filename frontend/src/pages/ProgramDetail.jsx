import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import ProgramImage from '../components/ui/ProgramImage.jsx'

export default function ProgramDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    axios.get(`${API_URL}/api/programs/${id}`)
      .then(({ data }) => {
        setProgram(data)
        // Load favorite status if user is logged in
        if (token && data) {
          loadFavoriteStatus()
        }
      })
      .catch(err => setMsg(err.response?.data?.error || 'Failed to load program'))
  }, [id, token])

  const loadFavoriteStatus = async () => {
    if (!token || !id) return
    try {
      const { data } = await axios.get(
        `${API_URL}/api/favorites/${id}/status`,
        { headers: apiHeaders(token) }
      )
      setIsFavorite(data.isFavorite || false)
    } catch (err) {
      console.error('Failed to load favorite status:', err)
    }
  }

  const toggleFavorite = async () => {
    if (!token) {
      alert('Please login to add favorites')
      return
    }
    setLoadingFavorite(true)
    try {
      const { data } = await axios.post(
        `${API_URL}/api/favorites/${id}/toggle`,
        {},
        { headers: apiHeaders(token) }
      )
      setIsFavorite(data.isFavorite)
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      alert(err.response?.data?.error || 'Failed to update favorite')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const enroll = async () => {
    setMsg('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/api/enrollments/${id}/enroll`, {}, { headers: apiHeaders(token) })
      const message = data.message || 'Successfully enrolled!'
      setMsg(message)
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to enroll')
      setLoading(false)
    }
  }

  if (!program) return <div className="note">Loading…</div>

  return (
    <Card>
      <ProgramImage 
        src={program.image_url} 
        alt={program.title}
        height="400px"
        style={{ marginBottom: '1.5rem' }}
      />
      <h2 style={{ marginBottom: '1rem' }}>{program.title}</h2>
      
      {program.description ? (
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
            📋 Description du programme
          </h3>
          <p style={{ 
            color: 'var(--text-secondary)', 
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {program.description}
          </p>
        </div>
      ) : (
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--card-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            Aucune description disponible pour ce programme.
          </p>
        </div>
      )}

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--card-bg)',
        borderRadius: '8px',
        border: '1px solid var(--border)'
      }}>
        <div>
          <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Durée</strong>
          <span style={{ fontSize: '1.1rem' }}>
            {program.duration ? `📅 ${program.duration} jours` : '📅 Durée flexible'}
          </span>
        </div>
      </div>
      {msg && (
        <div className={msg.includes('Failed') || msg.includes('error') ? 'error' : 'note'} style={{ marginBottom: '1rem' }}>
          {msg}
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {token && (
          <Button 
            onClick={toggleFavorite} 
            disabled={loadingFavorite}
            style={{
              background: isFavorite 
                ? 'var(--gradient-purple)' 
                : 'var(--card-soft)',
              border: isFavorite ? 'none' : '2px solid var(--border)',
              color: isFavorite ? 'white' : 'var(--fg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{isFavorite ? '⭐' : '☆'}</span>
            <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </Button>
        )}
        <Button onClick={enroll} disabled={!token || loading}>
          {loading ? 'Enrolling...' : 'Enroll in Program'}
        </Button>
      </div>
      {!token && <div className="note" style={{ marginTop: '0.5rem' }}>Please login to enroll in this program or add favorites</div>}
    </Card>
  )
}


