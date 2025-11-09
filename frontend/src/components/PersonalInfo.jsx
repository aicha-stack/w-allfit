import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'

export default function PersonalInfo() {
  const { token, user, setUser } = useAuth()
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [cycleStartDate, setCycleStartDate] = useState('')
  const [cycleDuration, setCycleDuration] = useState('28')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (token && user) {
      setWeight(user.weight ? String(user.weight) : '')
      setHeight(user.height ? String(user.height) : '')
      setCycleStartDate(user.menstrual_cycle_start_date || '')
      setCycleDuration(user.menstrual_cycle_duration ? String(user.menstrual_cycle_duration) : '28')
      setLoading(false)
    }
  }, [token, user])

  const calculateBMI = () => {
    if (weight && height) {
      const weightKg = parseFloat(weight)
      const heightM = parseFloat(height) / 100
      if (weightKg > 0 && heightM > 0) {
        const bmi = (weightKg / (heightM * heightM)).toFixed(1)
        return bmi
      }
    }
    return null
  }

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Sous-poids', color: '#3b82f6' }
    if (bmi < 25) return { label: 'Normal', color: '#22c55e' }
    if (bmi < 30) return { label: 'Surpoids', color: '#eab308' }
    return { label: 'Obésité', color: '#ef4444' }
  }

  const calculateNextPeriod = () => {
    if (cycleStartDate && cycleDuration) {
      const startDate = new Date(cycleStartDate)
      const duration = parseInt(cycleDuration) || 28
      const nextDate = new Date(startDate)
      nextDate.setDate(nextDate.getDate() + duration)
      return nextDate.toISOString().split('T')[0]
    }
    return null
  }

  const calculateCycleDay = () => {
    if (cycleStartDate) {
      const startDate = new Date(cycleStartDate)
      const today = new Date()
      const diffTime = today - startDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const cycleLength = parseInt(cycleDuration) || 28
      const currentDay = (diffDays % cycleLength) + 1
      return { day: currentDay, total: cycleLength }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const { data } = await axios.put(`${API_URL}/api/users/profile`, {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        menstrual_cycle_start_date: cycleStartDate || null,
        menstrual_cycle_duration: cycleDuration ? parseInt(cycleDuration) : 28
      }, { headers: apiHeaders(token) })
      setUser(data)
      setSuccess('Informations personnelles mises à jour avec succès!')
    } catch (err) {
      setError(err.response?.data?.error || 'Échec de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="note">Chargement...</div>

  const bmi = calculateBMI()
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null
  const nextPeriod = calculateNextPeriod()
  const cycleInfo = calculateCycleDay()

  return (
    <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>
        Informations Personnelles
      </h3>
      
      {error && (
        <div className="error" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <span>⚠️</span>
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
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Input 
            label="Poids (kg)"
            type="number"
            step="0.1"
            min="30"
            max="200"
            value={weight} 
            onChange={(e) => setWeight(e.target.value)} 
            placeholder="65.5"
            validation={(value) => {
              if (value) {
                const num = parseFloat(value)
                if (isNaN(num) || num < 30 || num > 200) {
                  return { valid: false, message: 'Poids entre 30 et 200 kg' }
                }
                return { valid: true, message: 'Poids valide' }
              }
              return null
            }}
          />
          <Input 
            label="Taille (cm)"
            type="number"
            step="0.1"
            min="100"
            max="250"
            value={height} 
            onChange={(e) => setHeight(e.target.value)} 
            placeholder="165"
            validation={(value) => {
              if (value) {
                const num = parseFloat(value)
                if (isNaN(num) || num < 100 || num > 250) {
                  return { valid: false, message: 'Taille entre 100 et 250 cm' }
                }
                return { valid: true, message: 'Taille valide' }
              }
              return null
            }}
          />
        </div>

        {bmi && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--card-soft)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  IMC (Indice de Masse Corporelle)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: bmiCategory?.color }}>
                  {bmi}
                </div>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: bmiCategory?.color + '20',
                color: bmiCategory?.color,
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {bmiCategory?.label}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>
            Cycle Menstruel
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <Input 
              label="Date de début des dernières règles"
              type="date"
              value={cycleStartDate} 
              onChange={(e) => setCycleStartDate(e.target.value)} 
            />
            <Input 
              label="Durée du cycle (jours)"
              type="number"
              min="21"
              max="35"
              value={cycleDuration} 
              onChange={(e) => setCycleDuration(e.target.value)} 
              placeholder="28"
              validation={(value) => {
                if (value) {
                  const num = parseInt(value)
                  if (isNaN(num) || num < 21 || num > 35) {
                    return { valid: false, message: 'Durée entre 21 et 35 jours' }
                  }
                  return { valid: true, message: 'Durée valide' }
                }
                return null
              }}
            />
          </div>

          {(nextPeriod || cycleInfo) && (
            <div style={{
              padding: '1rem',
              background: 'var(--card-soft)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              display: 'grid',
              gap: '0.75rem'
            }}>
              {cycleInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Jour du cycle actuel:
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand)' }}>
                    Jour {cycleInfo.day} / {cycleInfo.total}
                  </span>
                </div>
              )}
              {nextPeriod && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Prochaines règles prévues:
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--brand)' }}>
                    {new Date(nextPeriod).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <Button type="submit" disabled={saving} style={{ width: '100%', marginTop: '1.5rem' }}>
          {saving ? 'Enregistrement...' : 'Enregistrer les informations'}
        </Button>
      </form>
    </Card>
  )
}

