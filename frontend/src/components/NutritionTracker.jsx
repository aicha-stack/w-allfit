import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'

export default function NutritionTracker() {
  const { token } = useAuth()
  const [nutrition, setNutrition] = useState(null)
  const [goals, setGoals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    try {
      const [nutritionRes, goalsRes] = await Promise.all([
        axios.get(`${API_URL}/api/nutrition/today`, { headers: apiHeaders(token) }),
        axios.get(`${API_URL}/api/nutrition/goals`, { headers: apiHeaders(token) })
      ])
      setNutrition(nutritionRes.data)
      setGoals(goalsRes.data)
      setCalories(String(nutritionRes.data.calories || 0))
      setProtein(String(nutritionRes.data.protein_g || 0))
      setCarbs(String(nutritionRes.data.carbs_g || 0))
      setFat(String(nutritionRes.data.fat_g || 0))
    } catch (err) {
      console.error('Failed to load nutrition:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/api/nutrition/today`, {
        calories: parseInt(calories) || 0,
        protein_g: parseInt(protein) || 0,
        carbs_g: parseInt(carbs) || 0,
        fat_g: parseInt(fat) || 0
      }, { headers: apiHeaders(token) })
      setEditing(false)
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update nutrition')
    }
  }

  if (loading) return <div className="note">Loading nutrition...</div>
  if (!nutrition || !goals) return null

  // Calculate percentages
  const totalGrams = (nutrition.protein_g || 0) + (nutrition.carbs_g || 0) + (nutrition.fat_g || 0)
  const proteinPercent = totalGrams > 0 ? Math.round(((nutrition.protein_g || 0) * 4 / (nutrition.calories || 1)) * 100) : 0
  const carbsPercent = totalGrams > 0 ? Math.round(((nutrition.carbs_g || 0) * 4 / (nutrition.calories || 1)) * 100) : 0
  const fatPercent = totalGrams > 0 ? Math.round(((nutrition.fat_g || 0) * 9 / (nutrition.calories || 1)) * 100) : 0

  const caloriesProgress = Math.min(100, Math.round(((nutrition.calories || 0) / goals.daily_calories) * 100))

  return (
    <Card style={{ 
      background: 'var(--card-soft)',
      border: '1.5px solid var(--border)'
    }}>
      {!editing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button 
            onClick={() => setEditing(true)} 
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem',
              background: 'var(--brand-light)',
              color: 'var(--brand)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--brand)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--brand-light)';
              e.target.style.color = 'var(--brand)';
            }}
          >
            ✏️ Edit
          </button>
        </div>
      )}

      {editing ? (
        <div className="form">
          <Input 
            label="Calories" 
            type="number"
            value={calories} 
            onChange={(e) => setCalories(e.target.value)} 
          />
          <Input 
            label="Protéines (g)" 
            type="number"
            value={protein} 
            onChange={(e) => setProtein(e.target.value)} 
          />
          <Input 
            label="Glucides (g)" 
            type="number"
            value={carbs} 
            onChange={(e) => setCarbs(e.target.value)} 
          />
          <Input 
            label="Lipides (g)" 
            type="number"
            value={fat} 
            onChange={(e) => setFat(e.target.value)} 
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button onClick={handleUpdate}>Enregistrer</Button>
            <Button onClick={() => { setEditing(false); loadData(); }}>Annuler</Button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Calories Circle */}
            <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
              <div style={{ 
                position: 'relative', 
                width: '120px', 
                height: '120px', 
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 2px 4px rgba(168,85,247,.2))' }}>
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff6b9d" />
                      <stop offset="100%" stopColor="#ff8fb3" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="65"
                    cy="65"
                    r="55"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="10"
                    opacity="0.3"
                  />
                  <circle
                    cx="65"
                    cy="65"
                    r="55"
                    fill="none"
                    stroke="url(#calorieGradient)"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 55}`}
                    strokeDashoffset={`${2 * Math.PI * 55 * (1 - caloriesProgress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    background: 'var(--gradient-purple)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {nutrition.calories || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Cal</div>
                </div>
              </div>
            </div>

            {/* Macronutrients */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <small style={{ color: 'var(--text-secondary)' }}>Pro</small>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span><strong>{proteinPercent}%</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>/ {goals.protein_percent}%</span>
                  </div>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: 'var(--border)', 
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,.05)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #ff6b9d 0%, #ff8fb3 100%)',
                    width: `${Math.min(100, (proteinPercent / goals.protein_percent) * 100)}%`,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 2px 4px rgba(168,85,247,.3)'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <small style={{ color: 'var(--text-secondary)' }}>Carb</small>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span><strong>{carbsPercent}%</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>/ {goals.carbs_percent}%</span>
                  </div>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: 'var(--border)', 
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,.05)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #a8e6cf 0%, #7dd3a0 100%)',
                    width: `${Math.min(100, (carbsPercent / goals.carbs_percent) * 100)}%`,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 2px 4px rgba(168,230,207,.3)'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <small style={{ color: 'var(--text-secondary)' }}>Fat</small>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span><strong>{fatPercent}%</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>/ {goals.fat_percent}%</span>
                  </div>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: 'var(--border)', 
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,.05)'
                }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #ffd89b 0%, #ffb347 100%)',
                    width: `${Math.min(100, (fatPercent / goals.fat_percent) * 100)}%`,
                    borderRadius: '10px',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 2px 4px rgba(255,179,71,.3)'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

