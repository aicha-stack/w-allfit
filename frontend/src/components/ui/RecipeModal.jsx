import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../../hooks/useAuth.jsx'
import Card from './Card.jsx'
import Button from './Button.jsx'
import ProgramImage from './ProgramImage.jsx'

export default function RecipeModal({ recipeId, recipe, isOpen, onClose }) {
  const [recipeData, setRecipeData] = useState(recipe || null)
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    // If recipe is passed as prop, use it directly
    if (recipe) {
      setRecipeData(recipe)
      return
    }
    
    // Otherwise, fetch by ID
    if (isOpen && recipeId && token && !recipeData) {
      loadRecipe()
    } else if (isOpen && !token) {
      setRecipeData(null)
      setLoading(false)
    }
  }, [isOpen, recipeId, token, recipe])

  const loadRecipe = async () => {
    if (!token || !recipeId) return
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/api/recipes/${recipeId}`, {
        headers: apiHeaders(token)
      })
      setRecipeData(data)
    } catch (err) {
      console.error('Failed to load recipe:', err)
      alert(err.response?.data?.error || 'Failed to load recipe details')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflow: 'auto'
      }}
      onClick={onClose}
    >
      <Card
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          background: 'var(--card)',
          position: 'relative',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p>Chargement de la recette...</p>
          </div>
        ) : recipeData ? (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.8)'
                e.target.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.5)'
                e.target.style.transform = 'scale(1)'
              }}
            >
              ✕
            </button>

            {/* Recipe Image */}
            {recipeData.image_url ? (
              <ProgramImage
                src={recipeData.image_url}
                alt={recipeData.title}
                height="300px"
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  borderRadius: '16px 16px 0 0',
                  marginBottom: '1.5rem'
                }}
              />
            ) : (
              <div
                style={{
                  height: '300px',
                  background: 'var(--gradient-soft)',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6rem',
                  marginBottom: '1.5rem'
                }}
              >
                🍽️
              </div>
            )}

            {/* Recipe Title */}
            <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
              {recipeData.title}
            </h2>

            {/* Description */}
            {recipeData.description && (
              <p
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}
              >
                {recipeData.description}
              </p>
            )}

            {/* Nutrition Info Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'var(--card-soft)',
                borderRadius: '12px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🔥</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Calories
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {recipeData.calories || 0}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⏱️</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Temps
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {recipeData.prep_time || 0} min
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🥩</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Protéines
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {recipeData.protein_g || 0}g
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🍞</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Glucides
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {recipeData.carbs_g || 0}g
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🥑</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Lipides
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                  {recipeData.fat_g || 0}g
                </div>
              </div>
              {recipeData.servings && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🍽️</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Portions
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                    {recipeData.servings}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {recipeData.tags && recipeData.tags.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '2rem'
                }}
              >
                {recipeData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--brand-light)',
                      color: 'var(--brand)',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {recipeData.ingredients && recipeData.ingredients.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>🥘</span>
                  <span>Ingrédients</span>
                </h3>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: '0.75rem'
                  }}
                >
                  {recipeData.ingredients.map((ingredient, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'var(--card-soft)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <span style={{ color: 'var(--brand)', fontSize: '1.2rem' }}>✓</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructions */}
            {recipeData.instructions && (
              <div style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    marginBottom: '1rem',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>📝</span>
                  <span>Instructions</span>
                </h3>
                <div
                  style={{
                    padding: '1.5rem',
                    background: 'var(--card-soft)',
                    borderRadius: '12px',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.8',
                    fontSize: '1rem'
                  }}
                >
                  {recipeData.instructions}
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '1rem'
              }}
            >
              Fermer
            </Button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <p>Recette non trouvée</p>
            <Button onClick={onClose} style={{ marginTop: '1rem' }}>
              Fermer
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

