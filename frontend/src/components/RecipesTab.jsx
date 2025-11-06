import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'
import ProgramImage from './ui/ProgramImage.jsx'

export default function RecipesTab() {
  const { token } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    prep_time: '',
    servings: '',
    ingredients: '',
    instructions: '',
    tags: ''
  })

  useEffect(() => {
    if (token) {
      loadRecipes()
    }
  }, [token])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      console.log('Loading recipes from:', `${API_URL}/api/recipes`)
      const response = await axios.get(`${API_URL}/api/recipes`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000 // 10 second timeout
        }
      )
      console.log('Loaded recipes response:', response)
      console.log('Loaded recipes data:', response.data)
      setRecipes(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Failed to load recipes:', err)
      console.error('Error response:', err.response)
      console.error('Error message:', err.message)
      console.error('Error code:', err.code)
      setRecipes([])
      
      // Handle authentication errors (will be handled by interceptor, but we can add specific handling here)
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token is invalid - interceptor will handle redirect
        console.warn('Authentication failed, token may be expired or invalid')
        // Don't show alert, interceptor will redirect
        return
      }
      
      // Handle network errors specifically
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || !err.response) {
        const errorMsg = `Network error: Cannot connect to backend server at ${API_URL}. Make sure the backend server is running.`
        console.error('Network error details:', errorMsg)
        alert(errorMsg)
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to load recipes'
        console.error('Error details:', errorMsg)
        if (err.response?.status !== 200) {
          alert(`Error: ${errorMsg}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const recipeData = {
        ...formData,
        calories: parseInt(formData.calories) || 0,
        protein_g: parseInt(formData.protein_g) || 0,
        carbs_g: parseInt(formData.carbs_g) || 0,
        fat_g: parseInt(formData.fat_g) || 0,
        prep_time: parseInt(formData.prep_time) || 0,
        servings: parseInt(formData.servings) || 1,
        ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      }
      await axios.post(`${API_URL}/api/recipes`, recipeData, 
        { headers: apiHeaders(token) }
      )
      setShowAddForm(false)
      setFormData({
        title: '', description: '', image_url: '', calories: '', protein_g: '', carbs_g: '', fat_g: '',
        prep_time: '', servings: '', ingredients: '', instructions: '', tags: ''
      })
      loadRecipes()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create recipe')
    }
  }

  const handleDelete = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return
    }
    setDeletingId(recipeId)
    try {
      const response = await axios.delete(`${API_URL}/api/recipes/${recipeId}`, 
        { headers: apiHeaders(token) }
      )
      console.log('Delete response:', response.data)
      await loadRecipes()
    } catch (err) {
      console.error('Delete error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete recipe'
      alert(`Error: ${errorMessage}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <div className="note">Loading recipes...</div>

  return (
    <div>
      {/* Network error message */}
      {recipes.length === 0 && !loading && (
        <div style={{ 
          padding: '1rem', 
          background: '#fff3cd', 
          border: '1px solid #ffc107', 
          borderRadius: '8px', 
          marginBottom: '1rem',
          color: '#856404'
        }}>
          <strong>⚠️ Connection Issue:</strong> If you see "Network error", make sure:
          <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
            <li>The backend server is running (check terminal where you started it)</li>
            <li>The API URL is correct: <code>{API_URL}</code></li>
            <li>Check browser console (F12) for more details</li>
          </ul>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>🍽️ Healthy Recipes</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} style={{ fontSize: '0.875rem' }}>
          {showAddForm ? '✕ Cancel' : '+ Add Recipe'}
        </Button>
      </div>

      {showAddForm && (
        <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create New Recipe</h4>
          <form onSubmit={handleSubmit} className="form">
            <Input
              label="Recipe Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <label>
              Description
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--card)',
                  fontSize: '0.95rem',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </label>
            <Input
              label="Image URL"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            {formData.image_url && (
              <div style={{ marginBottom: '1rem' }}>
                <ProgramImage src={formData.image_url} alt="Preview" height="150px" />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Input
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
              <Input
                label="Prep Time (min)"
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
              />
              <Input
                label="Protein (g)"
                type="number"
                value={formData.protein_g}
                onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={formData.carbs_g}
                onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
              />
              <Input
                label="Fat (g)"
                type="number"
                value={formData.fat_g}
                onChange={(e) => setFormData({ ...formData, fat_g: e.target.value })}
              />
              <Input
                label="Servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              />
            </div>
            <label>
              Ingredients (one per line) *
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                rows={5}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--card)',
                  fontSize: '0.95rem',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="1 cup quinoa&#10;2 cups water&#10;1 tbsp olive oil"
              />
            </label>
            <label>
              Instructions *
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--card)',
                  fontSize: '0.95rem',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Step 1: ...&#10;Step 2: ..."
              />
            </label>
            <Input
              label="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="breakfast, vegan, healthy"
            />
            <Button type="submit" style={{ marginTop: '0.5rem' }}>
              ✓ Create Recipe
            </Button>
          </form>
        </Card>
      )}

      {recipes.length > 0 ? (
        <div className="grid">
          {recipes.map(recipe => (
            <Card key={recipe.id} style={{ background: 'var(--card-soft)' }}>
              {recipe.image_url ? (
                <ProgramImage 
                  src={recipe.image_url} 
                  alt={recipe.title}
                  height="200px"
                  style={{ marginBottom: '1rem', borderRadius: '16px' }}
                />
              ) : (
                <div style={{ 
                  height: '200px', 
                  background: 'var(--gradient-soft)', 
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  marginBottom: '1rem'
                }}>
                  🍽️
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, flex: '1' }}>{recipe.title}</h4>
                {recipe.user_id && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'var(--brand-light)',
                    color: 'var(--brand)',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    My Recipe
                  </span>
                )}
                {!recipe.user_id && (
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: 'var(--card)',
                    color: 'var(--text-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    border: '1px solid var(--border)'
                  }}>
                    System Recipe
                  </span>
                )}
              </div>
              {recipe.description && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '0.75rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {recipe.description}
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <small style={{ color: 'var(--text-secondary)' }}>🔥 {recipe.calories || 0} Cal</small>
                <small style={{ color: 'var(--text-secondary)' }}>⏱️ {recipe.prep_time || 0} min</small>
                <small style={{ color: 'var(--text-secondary)' }}>🥩 {recipe.protein_g || 0}g</small>
                <small style={{ color: 'var(--text-secondary)' }}>🍞 {recipe.carbs_g || 0}g</small>
              </div>
              {recipe.tags && recipe.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {recipe.tags.map((tag, idx) => (
                    <span key={idx} style={{
                      padding: '0.25rem 0.5rem',
                      background: 'var(--brand-light)',
                      color: 'var(--brand)',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button style={{ flex: '1', fontSize: '0.875rem' }}>
                  View Recipe
                </Button>
                {recipe.user_id && (
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    disabled={deletingId === recipe.id}
                    style={{
                      padding: '0.5rem 1rem',
                      background: deletingId === recipe.id ? '#ccc' : '#ffebee',
                      color: deletingId === recipe.id ? '#666' : '#d32f2f',
                      border: `1.5px solid ${deletingId === recipe.id ? '#999' : '#ffcdd2'}`,
                      borderRadius: '12px',
                      cursor: deletingId === recipe.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      flex: '0 0 auto',
                      opacity: deletingId === recipe.id ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== recipe.id) {
                        e.target.style.background = '#ffcdd2';
                        e.target.style.borderColor = '#d32f2f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deletingId !== recipe.id) {
                        e.target.style.background = '#ffebee';
                        e.target.style.borderColor = '#ffcdd2';
                      }
                    }}
                    title={deletingId === recipe.id ? 'Deleting...' : 'Delete this recipe'}
                  >
                    {deletingId === recipe.id ? '⏳' : '🗑️'}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
          <p style={{ color: 'var(--text-secondary)' }}>No recipes yet. Create your first recipe!</p>
        </Card>
      )}
    </div>
  )
}

