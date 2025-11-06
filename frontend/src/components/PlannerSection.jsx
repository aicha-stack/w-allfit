import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'
import WeeklyPlanner from './WeeklyPlanner.jsx'

export default function PlannerSection() {
  const { token } = useAuth()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('weekly')
  const [showAddForm, setShowAddForm] = useState(false)
  const [enrollments, setEnrollments] = useState([])

  const [formData, setFormData] = useState({
    day_of_week: '',
    scheduled_date: '',
    program_id: '',
    workout_type: '',
    workout_name: '',
    notes: ''
  })

  // Helper to get Monday of a week
  const getMonday = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  useEffect(() => {
    if (token) {
      loadSchedule()
      loadEnrollments()
    } else {
      setLoading(false)
    }
  }, [token])

  const loadSchedule = async () => {
    try {
      setLoading(true)
      // For the Schedule tab, load ALL workouts, not just current week
      // We'll use a date far in the past to get all workouts
      const allTimeStart = '2020-01-01' // Start date to get all workouts
      console.log('Loading all workouts for schedule tab')
      const { data } = await axios.get(`${API_URL}/api/planner/weekly?weekStart=${allTimeStart}`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      console.log('Loaded schedule:', data)
      // Sort by scheduled_date (most recent first) or by day_of_week
      const sortedData = Array.isArray(data) ? data.sort((a, b) => {
        if (a.scheduled_date && b.scheduled_date) {
          return new Date(a.scheduled_date) - new Date(b.scheduled_date)
        }
        if (a.scheduled_date) return -1
        if (b.scheduled_date) return 1
        return (a.day_of_week || 0) - (b.day_of_week || 0)
      }) : []
      setSchedule(sortedData)
    } catch (err) {
      console.error('Failed to load schedule:', err)
      console.error('Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setSchedule([])
    } finally {
      setLoading(false)
    }
  }

  const loadEnrollments = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/enrollments/me`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load enrollments:', err)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setEnrollments([])
    }
  }

  const handleAddSchedule = async (e) => {
    e.preventDefault()
    try {
      console.log('Submitting workout schedule:', formData)
      
      // Validate that either day_of_week or scheduled_date is provided
      if (!formData.day_of_week && !formData.scheduled_date) {
        alert('Please select either a day of week or a specific date')
        return
      }

      // Clean up the data: convert empty strings to null for integer fields
      const cleanedData = {
        day_of_week: formData.day_of_week === '' ? null : parseInt(formData.day_of_week, 10),
        scheduled_date: formData.scheduled_date === '' ? null : formData.scheduled_date,
        program_id: formData.program_id === '' ? null : parseInt(formData.program_id, 10),
        workout_type: formData.workout_type === '' ? null : formData.workout_type,
        workout_name: formData.workout_name === '' ? null : formData.workout_name,
        notes: formData.notes === '' ? null : formData.notes
      }

      console.log('Cleaned data:', cleanedData)

      // Validate day_of_week is a number if provided
      if (cleanedData.day_of_week !== null && isNaN(cleanedData.day_of_week)) {
        alert('Day of week must be a valid number')
        return
      }

      // Validate program_id is a number if provided
      if (cleanedData.program_id !== null && isNaN(cleanedData.program_id)) {
        alert('Program ID must be a valid number')
        return
      }

      console.log('Sending request to:', `${API_URL}/api/planner`)
      const response = await axios.post(`${API_URL}/api/planner`, cleanedData, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      console.log('Workout scheduled successfully:', response.data)
      
      setShowAddForm(false)
      setFormData({
        day_of_week: '',
        scheduled_date: '',
        program_id: '',
        workout_type: '',
        workout_name: '',
        notes: ''
      })
      
      // Reload schedule to show the new workout
      await loadSchedule()
      
      // Show success message
      alert('Workout scheduled successfully!')
    } catch (err) {
      console.error('Error scheduling workout:', err)
      console.error('Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      const errorMsg = err.response?.data?.error || err.message || 'Failed to schedule workout'
      console.error('Error message:', errorMsg)
      alert(`Error: ${errorMsg}`)
    }
  }

  const deleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this workout?')) return
    try {
      await axios.delete(`${API_URL}/api/planner/${id}`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      loadSchedule()
    } catch (err) {
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      alert(err.response?.data?.error || err.message || 'Failed to delete workout')
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // Get workout type color
  const getWorkoutTypeColor = (type) => {
    const colors = {
      'CARDIO': { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', icon: '🏃‍♀️' },
      'STRENGTH': { bg: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', icon: '💪' },
      'MOBILITY': { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', icon: '🧘‍♀️' },
      'HIIT': { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', icon: '⚡' },
      'YOGA': { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', icon: '🧘' }
    }
        return colors[type] || { bg: 'var(--gradient-purple)', icon: '💪' }
  }

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Sub Navigation - Modern Design */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        marginBottom: '2.5rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {[
          { name: 'Weekly', icon: '📅' },
          { name: 'Schedule', icon: '📋' }
        ].map(tab => {
          const isActive = activeSubTab === tab.name.toLowerCase()
          return (
            <button
              key={tab.name}
              onClick={() => setActiveSubTab(tab.name.toLowerCase())}
              style={{
                padding: '0.875rem 1.5rem',
                    background: isActive ? 'var(--gradient-purple)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                border: isActive ? 'none' : '2px solid var(--border)',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isActive ? '0 4px 12px rgba(168,85,247,.3)' : 'none',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.background = 'var(--brand-light)'
                  e.target.style.borderColor = 'var(--brand)'
                  e.target.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.background = 'transparent'
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.transform = 'translateY(0)'
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeSubTab === 'weekly' && (
        <div>
          <WeeklyPlanner />
        </div>
      )}

      {activeSubTab === 'schedule' && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ 
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.5rem'
              }}>
                <span>📋</span>
                <span>Workout Schedule</span>
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Plan and manage your workouts
              </p>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)} 
              style={{ 
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: showAddForm ? 'none' : '0 4px 12px rgba(168,85,247,.3)'
              }}
            >
              <span>{showAddForm ? '✕' : '+'}</span>
              <span>{showAddForm ? 'Cancel' : 'Add Workout'}</span>
            </Button>
          </div>

          {showAddForm && (
            <Card style={{ 
              marginBottom: '2.5rem', 
              background: 'linear-gradient(135deg, rgba(196,132,252,0.1) 0%, rgba(168,85,247,0.05) 100%)',
              border: '2px solid var(--border)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,.08)',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1.25rem'
                }}>
                  <span>✨</span>
                  <span>New Workout Schedule</span>
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  Fill in the details to schedule your workout
                </p>
              </div>
              <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                      📅 Day of Week
                    </span>
                    <select
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                      style={{
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border)',
                        borderRadius: '12px',
                        background: 'var(--card)',
                        fontSize: '0.95rem',
                        width: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="">Select day</option>
                      {days.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                      📆 Or Specific Date
                    </span>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      style={{
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border)',
                        borderRadius: '12px',
                        background: 'var(--card)',
                        fontSize: '0.95rem',
                        width: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                      📚 Program (Optional)
                    </span>
                    <select
                      value={formData.program_id}
                      onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                      style={{
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border)',
                        borderRadius: '12px',
                        background: 'var(--card)',
                        fontSize: '0.95rem',
                        width: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="">None</option>
                      {enrollments.map(e => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                      🏋️ Workout Type
                    </span>
                    <select
                      value={formData.workout_type}
                      onChange={(e) => setFormData({ ...formData, workout_type: e.target.value })}
                      style={{
                        padding: '0.875rem 1rem',
                        border: '2px solid var(--border)',
                        borderRadius: '12px',
                        background: 'var(--card)',
                        fontSize: '0.95rem',
                        width: '100%',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--brand)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="">Select type</option>
                      <option value="CARDIO">🏃‍♀️ Cardio</option>
                      <option value="STRENGTH">💪 Strength</option>
                      <option value="MOBILITY">🧘‍♀️ Mobility</option>
                      <option value="HIIT">⚡ HIIT</option>
                      <option value="YOGA">🧘 Yoga</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                    ✏️ Workout Name
                  </span>
                  <input
                    type="text"
                    value={formData.workout_name}
                    onChange={(e) => setFormData({ ...formData, workout_name: e.target.value })}
                    placeholder="e.g., Morning Run, Upper Body"
                    style={{
                      padding: '0.875rem 1rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      background: 'var(--card)',
                      fontSize: '0.95rem',
                      width: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--brand)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--fg)' }}>
                    📝 Notes (Optional)
                  </span>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    style={{
                      padding: '0.875rem 1rem',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      background: 'var(--card)',
                      fontSize: '0.95rem',
                      width: '100%',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      transition: 'all 0.3s ease'
                    }}
                    placeholder="Add any notes about this workout..."
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--brand)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(168,85,247,.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </label>
                <Button 
                  type="submit" 
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(168,85,247,.3)'
                  }}
                >
                  <span>✓</span>
                  <span>Schedule Workout</span>
                </Button>
              </form>
            </Card>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.25rem'
            }}>
              <span>📋</span>
              <span>Scheduled Workouts</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              {schedule.length > 0 ? `${schedule.length} workout${schedule.length !== 1 ? 's' : ''} scheduled` : 'No workouts scheduled yet'}
            </p>
          </div>

          {loading ? (
            <Card style={{ 
              textAlign: 'center', 
              padding: '3rem 2rem', 
              background: 'var(--card-soft)',
              borderRadius: '20px'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>⏳</div>
              <p style={{ color: 'var(--text-secondary)' }}>Loading schedule...</p>
            </Card>
          ) : schedule.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {schedule.map(s => {
                const workoutTypeInfo = getWorkoutTypeColor(s.workout_type)
                const dateDisplay = s.scheduled_date 
                  ? formatDate(s.scheduled_date)
                  : (s.day_of_week !== null ? days[s.day_of_week] : 'Recurring')
                
                return (
                  <Card 
                    key={s.id} 
                    style={{ 
                      background: s.completed 
                        ? 'linear-gradient(135deg, rgba(168,230,207,0.1) 0%, rgba(125,211,160,0.05) 100%)'
                        : 'var(--card-soft)',
                      border: s.completed 
                        ? '2px solid rgba(168,230,207,0.3)'
                        : '2px solid var(--border)',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.08)'
                    }}
                  >
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: s.completed 
                        ? 'linear-gradient(135deg, #a8e6cf 0%, #7dd3a0 100%)'
                        : 'linear-gradient(135deg, #ff8fb3 0%, #ff6b9d 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,.15)'
                    }}>
                      {s.completed ? '✅' : '⏳'}
                    </div>

                    {/* Workout Type Badge */}
                    {s.workout_type && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: workoutTypeInfo.bg,
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,.15)'
                      }}>
                        <span>{workoutTypeInfo.icon}</span>
                        <span>{s.workout_type}</span>
                      </div>
                    )}

                    {/* Workout Name */}
                    <h5 style={{ 
                      marginBottom: '0.75rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: 'var(--fg)',
                      paddingRight: '3rem'
                    }}>
                      {s.workout_name || s.program_title || 'Workout'}
                    </h5>

                    {/* Date/Time Info */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--card)',
                      borderRadius: '10px',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>📅</span>
                      <span style={{ fontWeight: '500' }}>{dateDisplay}</span>
                    </div>

                    {/* Notes */}
                    {s.notes && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'var(--card)',
                        borderRadius: '12px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                        border: '1px solid var(--border)'
                      }}>
                        {s.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                      {!s.completed && (
                        <Button 
                          onClick={async () => {
                            try {
                              await axios.put(`${API_URL}/api/planner/${s.id}/complete`, {},
                                { 
                                  headers: apiHeaders(token),
                                  timeout: 10000
                                }
                              )
                              loadSchedule()
                            } catch (err) {
                              if (err.response?.status === 401 || err.response?.status === 403) {
                                return
                              }
                              alert(err.response?.data?.error || err.message || 'Failed to mark as complete')
                            }
                          }}
                          style={{ 
                            flex: '1', 
                            fontSize: '0.875rem',
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #a8e6cf 0%, #7dd3a0 100%)',
                            border: 'none',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(168,230,207,.3)'
                          }}
                        >
                          ✓ Complete
                        </Button>
                      )}
                      <Button 
                        onClick={() => deleteSchedule(s.id)}
                        style={{ 
                          flex: s.completed ? '1' : '1',
                          fontSize: '0.875rem',
                          padding: '0.75rem 1rem',
                          background: '#ffebee',
                          color: '#d32f2f',
                          border: '2px solid #ffcdd2',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#ffcdd2'
                          e.target.style.transform = 'scale(1.02)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#ffebee'
                          e.target.style.transform = 'scale(1)'
                        }}
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              background: 'linear-gradient(135deg, rgba(196,132,252,0.1) 0%, rgba(168,85,247,0.05) 100%)',
              borderRadius: '20px',
              border: '2px dashed var(--border)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'float 3s ease-in-out infinite' }}>📅</div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--fg)' }}>No Workouts Scheduled</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Start planning your fitness journey by scheduling your first workout!
              </p>
              <Button 
                onClick={() => setShowAddForm(true)} 
                style={{ 
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(168,85,247,.3)'
                }}
              >
                + Schedule Your First Workout
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

