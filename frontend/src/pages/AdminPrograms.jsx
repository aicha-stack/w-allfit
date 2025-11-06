import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import { Navigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Card from '../components/ui/Card.jsx'
import ProgramImage from '../components/ui/ProgramImage.jsx'

export default function AdminPrograms() {
  const { token, user } = useAuth()
  const [programs, setPrograms] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'
  if (!isAdmin) return <Navigate to="/programs" replace />

  const load = () => {
    axios.get(`${API_URL}/api/programs`).then(({ data }) => setPrograms(data))
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDuration('')
    setImageUrl('')
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditDuration('')
    setEditImageUrl('')
  }

  const createProgram = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post(`${API_URL}/api/programs`, {
        title, 
        description, 
        duration: duration ? Number(duration) : null,
        image_url: imageUrl || null
      }, { headers: apiHeaders(token) })
      resetForm()
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create')
    }
  }

  const startEdit = (program) => {
    setEditingId(program.id)
    setEditTitle(program.title)
    setEditDescription(program.description || '')
    setEditDuration(program.duration ? String(program.duration) : '')
    setEditImageUrl(program.image_url || '')
    setError('')
  }

  const cancelEdit = () => {
    resetForm()
  }

  const updateProgram = async (id) => {
    setError('')
    try {
      await axios.put(`${API_URL}/api/programs/${id}`, {
        title: editTitle,
        description: editDescription,
        duration: editDuration ? Number(editDuration) : null,
        image_url: editImageUrl || null
      }, { headers: apiHeaders(token) })
      resetForm()
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update')
    }
  }

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    setError('')
    try {
      await axios.delete(`${API_URL}/api/programs/${id}`, { headers: apiHeaders(token) })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div>
      <h2>Admin: Programs</h2>
      <Card>
        <h3>{editingId ? 'Edit Program' : 'Create Program'}</h3>
        {error && <div className="error">{error}</div>}
        <form className="form" onSubmit={(e) => {
          e.preventDefault()
          if (editingId) {
            updateProgram(editingId)
          } else {
            createProgram(e)
          }
        }}>
          <Input 
            label="Title" 
            value={editingId ? editTitle : title} 
            onChange={(e) => editingId ? setEditTitle(e.target.value) : setTitle(e.target.value)} 
            required 
          />
          <label>
            Description du programme
            <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Décrivez en détail le programme, ses objectifs, les exercices inclus, et les bénéfices pour les utilisatrices.
            </small>
            <textarea
              value={editingId ? editDescription : description}
              onChange={(e) => editingId ? setEditDescription(e.target.value) : setDescription(e.target.value)}
              placeholder="Exemple: Ce programme de 30 jours est spécialement conçu pour les femmes qui souhaitent renforcer leur corps tout en respectant leur cycle hormonal. Il comprend des exercices adaptés, des séances de cardio modérées, et des moments de récupération essentiels..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--card-bg)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </label>
          <Input 
            label="Duration (days)" 
            value={editingId ? editDuration : duration} 
            onChange={(e) => editingId ? setEditDuration(e.target.value) : setDuration(e.target.value)} 
            type="number" 
            min="1" 
          />
          <Input 
            label="Image URL" 
            value={editingId ? editImageUrl : imageUrl} 
            onChange={(e) => editingId ? setEditImageUrl(e.target.value) : setImageUrl(e.target.value)} 
            type="url"
            placeholder="https://example.com/image.jpg"
          />
          {(editingId ? editImageUrl : imageUrl) && (
            <div style={{ marginTop: '0.5rem' }}>
              <small>Aperçu:</small>
              <div style={{ 
                width: '100%', 
                maxHeight: '200px', 
                overflow: 'hidden',
                borderRadius: '8px',
                marginTop: '0.5rem',
                background: 'var(--border)'
              }}>
                <img 
                  src={editingId ? editImageUrl : imageUrl} 
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Image non disponible</div>'
                  }}
                />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            {editingId && (
              <Button type="button" onClick={cancelEdit}>Cancel</Button>
            )}
          </div>
        </form>
      </Card>

      <div className="grid">
        {programs.map(p => (
          <Card key={p.id}>
            {editingId === p.id ? (
              <div>
                <h4>Editing: {p.title}</h4>
                <p>Use the form above to edit this program.</p>
              </div>
            ) : (
              <>
                <ProgramImage 
                  src={p.image_url} 
                  alt={p.title}
                  height="150px"
                  style={{ marginBottom: '1rem' }}
                />
                <h4 style={{ marginBottom: '0.5rem' }}>{p.title}</h4>
                {p.description ? (
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.5',
                    fontSize: '0.9rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {p.description}
                  </p>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Aucune description
                  </p>
                )}
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  {p.duration ? `📅 ${p.duration} jours` : '📅 Durée non définie'}
                </small>
                <div style={{ marginTop: '.5rem', display: 'flex', gap: '0.5rem' }}>
                  <Button onClick={() => startEdit(p)}>Edit</Button>
                  <Button onClick={() => remove(p.id)}>Delete</Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}


