import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ProgramImage from '../components/ui/ProgramImage.jsx'

export default function Programs() {
  const { token } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState({}) // Map of programId -> isFavorite

  useEffect(() => {
    let mounted = true
    console.log('Fetching programs from:', `${API_URL}/api/programs`)
    axios.get(`${API_URL}/api/programs`)
      .then(({ data }) => {
        console.log('Programs received:', data)
        if (mounted) {
          setPrograms(Array.isArray(data) ? data : [])
          // Load favorite statuses if user is logged in
          if (token && data && Array.isArray(data) && data.length > 0) {
            loadFavoriteStatuses(data.map(p => p.id))
          }
        }
      })
      .catch(err => {
        console.error('Error fetching programs:', err)
        console.error('Response:', err.response)
        if (mounted) {
          setPrograms([])
          const errorMsg = err.response?.data?.error || err.message || 'Erreur de connexion au serveur'
          setError(`Impossible de charger les programmes: ${errorMsg}. Vérifiez que le backend est démarré et que VITE_API_URL est correct (actuellement: ${API_URL})`)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [token])

  const loadFavoriteStatuses = async (programIds) => {
    if (!token || !programIds || programIds.length === 0) return
    try {
      const { data } = await axios.get(
        `${API_URL}/api/favorites/statuses?programIds=${programIds.join(',')}`,
        { headers: apiHeaders(token) }
      )
      setFavorites(data)
    } catch (err) {
      console.error('Failed to load favorite statuses:', err)
    }
  }

  const toggleFavorite = async (e, programId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token) {
      alert('Please login to add favorites')
      return
    }
    try {
      const { data } = await axios.post(
        `${API_URL}/api/favorites/${programId}/toggle`,
        {},
        { headers: apiHeaders(token) }
      )
      setFavorites(prev => ({ ...prev, [programId]: data.isFavorite }))
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      alert(err.response?.data?.error || 'Failed to update favorite')
    }
  }

  // Filter programs based on search term
  const filteredPrograms = useMemo(() => {
    if (!searchTerm.trim()) {
      return programs
    }
    
    const term = searchTerm.toLowerCase().trim()
    return programs.filter(program => {
      const title = (program.title || '').toLowerCase()
      const description = (program.description || '').toLowerCase()
      return title.includes(term) || description.includes(term)
    })
  }, [programs, searchTerm])

  if (loading) return <div className="note">Loading programs…</div>

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className="emoji-large" style={{ marginBottom: '1rem' }}></div>
        <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="emoji"></span>
          Nos Programmes Personnalisés
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          <span className="emoji"></span> Découvrez des programmes de fitness adaptés à vos besoins spécifiques, 
          conçus pour vous accompagner dans votre parcours de transformation.
        </p>
      </div>

      {error && (
        <div className="error" style={{ marginBottom: '1rem', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Rechercher un programme (titre, description)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              fontSize: '1rem',
              border: '1.5px solid var(--border)',
              borderRadius: '16px',
              background: 'var(--card)',
              color: 'var(--fg)',
              boxSizing: 'border-box',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--brand)'
              e.target.style.boxShadow = '0 0 0 4px rgba(168,85,247,.15)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <span className="emoji" style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.2rem',
            pointerEvents: 'none'
          }}></span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                fontSize: '1.2rem'
              }}
              title="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {filteredPrograms.length === 0 
              ? 'Aucun résultat trouvé' 
              : `${filteredPrograms.length} programme${filteredPrograms.length > 1 ? 's' : ''} trouvé${filteredPrograms.length > 1 ? 's' : ''}`
            }
          </div>
        )}
      </div>

      {programs.length ? (
        filteredPrograms.length > 0 ? (
          <div className="grid">
            {filteredPrograms.map(p => (
              <Link key={p.id} to={`/programs/${p.id}`} style={{ textDecoration: 'none' }}>
                <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                  {/* Favorite Button */}
                  {token && (
                    <button
                      onClick={(e) => toggleFavorite(e, p.id)}
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: favorites[p.id] 
                          ? 'var(--gradient-purple)' 
                          : 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)'
                        e.target.style.boxShadow = '0 4px 12px rgba(168,85,247,.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,.15)'
                      }}
                      title={favorites[p.id] ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites[p.id] ? '⭐' : '☆'}
                    </button>
                  )}
                  <ProgramImage 
                    src={p.image_url} 
                    alt={p.title}
                    height="200px"
                    style={{ marginBottom: '1rem' }}
                  />
                  <h3 style={{ marginBottom: '0.5rem' }}>{p.title}</h3>
                  {p.description ? (
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      marginBottom: '1rem',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.description}
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1rem' }}>
                      Aucune description disponible
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <small style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="emoji">📅</span>
                      <span>{p.duration ? `${p.duration} jours` : 'Durée flexible'}</span>
                    </small>
                    <small style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>Voir plus</span>
                      <span className="emoji">→</span>
                    </small>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState 
            title="Aucun résultat trouvé" 
            description={`Aucun programme ne correspond à "${searchTerm}". Essayez avec d'autres mots-clés.`} 
          />
        )
      ) : (
        <EmptyState 
          title="Aucun programme disponible pour le moment" 
          description="Revenez bientôt pour découvrir nos nouveaux programmes personnalisés." 
        />
      )}
    </div>
  )
}


