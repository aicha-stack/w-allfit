import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'
import NutritionTracker from './NutritionTracker.jsx'
import ProgramImage from './ui/ProgramImage.jsx'
import RecipesTab from './RecipesTab.jsx'

const RecipesTabComponent = RecipesTab

export default function NutritionSection() {
  const { token } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('tracker')

  useEffect(() => {
    if (token && activeSubTab === 'history') {
      loadHistory()
    } else {
      setLoading(false)
    }
  }, [token, activeSubTab])

  const loadHistory = async () => {
    try {
      // For now, we'll use today's nutrition data as placeholder
      // In the future, this can be expanded to fetch historical data
      const { data } = await axios.get(`${API_URL}/api/nutrition/today`, 
        { headers: apiHeaders(token) }
      )
      // Create a simple history array from today's data
      setHistory([{ ...data, log_date: new Date().toISOString().split('T')[0] }])
    } catch (err) {
      console.error('Failed to load history:', err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Sub Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.75rem'
      }}>
        {['Tracker', 'History', 'Recipes', 'Goals'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab.toLowerCase())}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeSubTab === tab.toLowerCase() ? 'var(--gradient-purple)' : 'transparent',
              color: activeSubTab === tab.toLowerCase() ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: activeSubTab === tab.toLowerCase() ? '600' : '500',
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'tracker' && (
        <NutritionTracker />
      )}

      {activeSubTab === 'history' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>📊 Nutrition History</h3>
          {loading ? (
            <div className="note">Loading history...</div>
          ) : history.length > 0 ? (
            <div className="grid">
              {history.map((day, index) => (
                <Card key={index} style={{ background: 'var(--card-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4>{new Date(day.log_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <small style={{ color: 'var(--text-secondary)' }}>Calories</small>
                      <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--brand)' }}>
                        {day.calories || 0}
                      </div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-secondary)' }}>Protein</small>
                      <div style={{ fontWeight: '600' }}>{day.protein_g || 0}g</div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-secondary)' }}>Carbs</small>
                      <div style={{ fontWeight: '600' }}>{day.carbs_g || 0}g</div>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-secondary)' }}>Fat</small>
                      <div style={{ fontWeight: '600' }}>{day.fat_g || 0}g</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p style={{ color: 'var(--text-secondary)' }}>No nutrition history yet</p>
            </Card>
          )}
        </div>
      )}

      {activeSubTab === 'recipes' && (
        <RecipesTabComponent />
      )}

      {activeSubTab === 'goals' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>🎯 Nutrition Goals</h3>
          <NutritionGoalsEditor />
        </div>
      )}
    </div>
  )
}

function NutritionGoalsEditor() {
  const { token } = useAuth()
  const [goals, setGoals] = useState(null)
  const [editing, setEditing] = useState(false)
  const [dailyCalories, setDailyCalories] = useState('')
  const [proteinPercent, setProteinPercent] = useState('')
  const [carbsPercent, setCarbsPercent] = useState('')
  const [fatPercent, setFatPercent] = useState('')

  useEffect(() => {
    if (token) {
      loadGoals()
    }
  }, [token])

  const loadGoals = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/nutrition/goals`, 
        { headers: apiHeaders(token) }
      )
      setGoals(data)
      setDailyCalories(String(data.daily_calories || 2000))
      setProteinPercent(String(data.protein_percent || 30))
      setCarbsPercent(String(data.carbs_percent || 40))
      setFatPercent(String(data.fat_percent || 30))
    } catch (err) {
      console.error('Failed to load goals:', err)
    }
  }

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/api/nutrition/goals`, {
        daily_calories: parseInt(dailyCalories),
        protein_percent: parseInt(proteinPercent),
        carbs_percent: parseInt(carbsPercent),
        fat_percent: parseInt(fatPercent)
      }, { headers: apiHeaders(token) })
      setEditing(false)
      loadGoals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update goals')
    }
  }

  if (!goals) return <div className="note">Loading goals...</div>

  return (
    <Card style={{ background: 'var(--card-soft)' }}>
      {!editing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <Button onClick={() => setEditing(true)} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              ✏️ Edit Goals
            </Button>
          </div>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              background: 'var(--card)', 
              borderRadius: '16px',
              border: '1.5px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Daily Calories</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  background: 'var(--gradient-purple)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {goals.daily_calories}
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--card)', 
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥩</div>
                <small style={{ color: 'var(--text-secondary)' }}>Protein</small>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#ff6b9d' }}>
                  {goals.protein_percent}%
                </div>
              </div>
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--card)', 
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍞</div>
                <small style={{ color: 'var(--text-secondary)' }}>Carbs</small>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#a8e6cf' }}>
                  {goals.carbs_percent}%
                </div>
              </div>
              <div style={{ 
                padding: '1.25rem', 
                background: 'var(--card)', 
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥑</div>
                <small style={{ color: 'var(--text-secondary)' }}>Fat</small>
                <div style={{ fontWeight: '700', fontSize: '1.2rem', color: '#ffd89b' }}>
                  {goals.fat_percent}%
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="form">
          <label>
            Daily Calories
            <input
              type="number"
              value={dailyCalories}
              onChange={(e) => setDailyCalories(e.target.value)}
              min="1000"
              max="5000"
            />
          </label>
          <label>
            Protein (%)
            <input
              type="number"
              value={proteinPercent}
              onChange={(e) => setProteinPercent(e.target.value)}
              min="10"
              max="50"
            />
          </label>
          <label>
            Carbs (%)
            <input
              type="number"
              value={carbsPercent}
              onChange={(e) => setCarbsPercent(e.target.value)}
              min="20"
              max="60"
            />
          </label>
          <label>
            Fat (%)
            <input
              type="number"
              value={fatPercent}
              onChange={(e) => setFatPercent(e.target.value)}
              min="15"
              max="40"
            />
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button onClick={handleSave} style={{ flex: '1' }}>Save</Button>
            <Button onClick={() => { setEditing(false); loadGoals(); }} style={{ 
              flex: '1',
              background: 'var(--card-soft)',
              color: 'var(--fg)',
              border: '1.5px solid var(--border)'
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

