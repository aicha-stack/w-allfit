import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'

// Helper to get the Monday of a given week
const getMonday = (d) => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDateLocal = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function WeeklyPlanner() {
  const { token } = useAuth()
  const [schedule, setSchedule] = useState([])
  const [workoutLogs, setWorkoutLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()))
  const [processingDates, setProcessingDates] = useState(new Set()) // Track dates being processed

  useEffect(() => {
    if (token) {
      loadSchedule()
      loadWorkoutLogs()
    }
  }, [token, currentWeek])

  const loadSchedule = async () => {
    try {
      setLoading(true)
      const monday = getMonday(currentWeek)
      // Use local date formatting to avoid timezone issues
      const weekStart = formatDateLocal(monday)
      console.log('WeeklyPlanner: Loading schedule for week starting:', weekStart)
      const { data } = await axios.get(`${API_URL}/api/planner/weekly?weekStart=${weekStart}`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      console.log('WeeklyPlanner: Loaded schedule:', data)
      setSchedule(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('WeeklyPlanner: Failed to load schedule:', err)
      console.error('WeeklyPlanner: Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setSchedule([])
    } finally {
      setLoading(false)
    }
  }

  const loadWorkoutLogs = async () => {
    try {
      const monday = getMonday(currentWeek)
      const weekEnd = new Date(monday)
      weekEnd.setDate(weekEnd.getDate() + 6)
      // Use local date formatting to avoid timezone issues
      const startDateStr = formatDateLocal(monday)
      const endDateStr = formatDateLocal(weekEnd)
      console.log('WeeklyPlanner: Loading workout logs from', startDateStr, 'to', endDateStr)
      const { data } = await axios.get(`${API_URL}/api/workout-logs?start_date=${startDateStr}&end_date=${endDateStr}`,
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      const logsMap = {}
      if (Array.isArray(data)) {
        data.forEach(log => {
          // Normalize the date to YYYY-MM-DD format
          let dateStr = log.workout_date
          if (dateStr instanceof Date) {
            dateStr = formatDateLocal(dateStr)
          } else if (typeof dateStr === 'string') {
            // Ensure it's in YYYY-MM-DD format (remove timezone if present)
            dateStr = dateStr.split('T')[0].split(' ')[0]
          }
          // Only store if completed is true (check both boolean true and string 'true')
          // PostgreSQL sometimes returns boolean as string or as actual boolean
          const isCompleted = log.completed === true || log.completed === 'true' || log.completed === 1
          if (isCompleted) {
            logsMap[dateStr] = true
          }
        })
      }
      console.log('WeeklyPlanner: Processed workout logs map:', logsMap)
      setWorkoutLogs(logsMap)
    } catch (err) {
      console.error('WeeklyPlanner: Failed to load workout logs:', err)
      console.error('WeeklyPlanner: Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setWorkoutLogs({})
    }
  }

  const toggleDayWorked = async (date) => {
    // Use local date formatting to avoid timezone issues
    const dateStr = formatDateLocal(date)
    
    // Prevent multiple clicks on the same date
    if (processingDates.has(dateStr)) {
      console.log('WeeklyPlanner: Already processing', dateStr, 'ignoring click')
      return
    }
    
    const isWorked = workoutLogs[dateStr] === true
    
    console.log('WeeklyPlanner: Toggling day worked for', dateStr, 'currently worked:', isWorked)
    
    // Mark as processing
    setProcessingDates(prev => new Set(prev).add(dateStr))
    
    // Optimistic update: update UI immediately
    setWorkoutLogs(prev => {
      const newLogs = { ...prev }
      if (isWorked) {
        // Remove the key when unmarking
        delete newLogs[dateStr]
      } else {
        // Add the key when marking
        newLogs[dateStr] = true
      }
      return newLogs
    })
    
    try {
      if (isWorked) {
        console.log('WeeklyPlanner: Unmarking day as worked')
        const response = await axios.post(`${API_URL}/api/workout-logs/unmark`, { date: dateStr },
          { 
            headers: apiHeaders(token),
            timeout: 10000
          }
        )
        console.log('WeeklyPlanner: Unmark response:', response.data)
      } else {
        console.log('WeeklyPlanner: Marking day as worked')
        const response = await axios.post(`${API_URL}/api/workout-logs/mark`, { date: dateStr },
          { 
            headers: apiHeaders(token),
            timeout: 10000
          }
        )
        console.log('WeeklyPlanner: Mark response:', response.data)
      }
      console.log('WeeklyPlanner: Day toggled successfully, reloading logs')
      // Reload to sync with server
      await loadWorkoutLogs()
    } catch (err) {
      console.error('WeeklyPlanner: Error toggling day worked:', err)
      console.error('WeeklyPlanner: Error code:', err.code)
      console.error('WeeklyPlanner: Error message:', err.message)
      console.error('WeeklyPlanner: Error response:', err.response)
      
      // Revert optimistic update on error
      setWorkoutLogs(prev => {
        const newLogs = { ...prev }
        if (isWorked) {
          // Restore the key if we were unmarking
          newLogs[dateStr] = true
        } else {
          // Remove the key if we were marking
          delete newLogs[dateStr]
        }
        return newLogs
      })
      
      // Handle network errors
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error' || !err.response) {
        const errorMsg = `Network error: Cannot connect to backend server at ${API_URL}. Make sure the backend server is running.`
        console.error('WeeklyPlanner: Network error:', errorMsg)
        alert(errorMsg)
      } else if (err.response?.status !== 401 && err.response?.status !== 403) {
        // Handle authentication errors (interceptor will handle redirect)
        const errorMsg = err.response?.data?.error || err.message || 'Failed to update workout log'
        console.error('WeeklyPlanner: Error details:', errorMsg)
        alert(`Error: ${errorMsg}`)
      }
    } finally {
      // Remove from processing set
      setProcessingDates(prev => {
        const newSet = new Set(prev)
        newSet.delete(dateStr)
        return newSet
      })
    }
  }

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  const dayAbbr = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI']

  const getDaySchedule = (dayIndex) => {
    // Filter by day_of_week or by scheduled_date if it matches the day
    // dayIndex: 0=Monday, 1=Tuesday, ..., 6=Sunday
    const monday = getMonday(currentWeek)
    const targetDate = new Date(monday)
    targetDate.setDate(targetDate.getDate() + dayIndex)
    const targetDateStr = targetDate.toISOString().split('T')[0]
    
    return schedule.filter(s => {
      // Match by day_of_week (0=Monday, 1=Tuesday, etc.)
      if (s.day_of_week !== null && s.day_of_week !== undefined) {
        // day_of_week in DB should be 0-6 where 0=Monday
        if (s.day_of_week === dayIndex) return true
      }
      // Match by scheduled_date
      if (s.scheduled_date && s.scheduled_date === targetDateStr) return true
      return false
    })
  }

  const prevWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const monday = getMonday(currentWeek)
  const weekEnd = new Date(monday)
  weekEnd.setDate(weekEnd.getDate() + 6)

  if (loading) return <div className="note">Loading planner...</div>

  return (
    <Card style={{ background: 'var(--card-soft)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>📅</span>
          <span>Weekly Planner</span>
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={prevWeek} 
            style={{ 
              padding: '0.5rem 0.75rem',
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
            ←
          </button>
          <small style={{ 
            minWidth: '180px', 
            textAlign: 'center',
            fontWeight: '600',
            color: 'var(--fg)'
          }}>
            {monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </small>
          <button 
            onClick={nextWeek} 
            style={{ 
              padding: '0.5rem 0.75rem',
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
            →
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
          {dayAbbr.map((abbr, index) => {
            const daySchedules = getDaySchedule(index)
            const hasScheduledWorkout = daySchedules.length > 0
            const isScheduledCompleted = daySchedules.some(s => s.completed)

            // Get the actual date for this day
            const monday = getMonday(currentWeek)
            const targetDate = new Date(monday)
            targetDate.setDate(targetDate.getDate() + index)
            // Use local date formatting to avoid timezone issues
            const targetDateStr = formatDateLocal(targetDate)
            // Check if day is marked as worked (explicitly check for true)
            const isDayWorked = workoutLogs[targetDateStr] === true
            
            const workoutTooltip = hasScheduledWorkout 
              ? daySchedules.map(s => s.workout_name || s.program_title || 'Workout').join(', ')
              : (isDayWorked ? 'Day worked!' : 'No scheduled workout')
            
            const isProcessing = processingDates.has(targetDateStr)
            
            return (
              <div 
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isProcessing) {
                    toggleDayWorked(targetDate)
                  }
                }}
                style={{
                  flex: '1',
                  textAlign: 'center',
                  padding: '0.5rem 0.25rem',
                  cursor: isProcessing ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing ? 0.6 : 1
                }}
                title={isProcessing ? 'Processing...' : workoutTooltip}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.background = 'var(--brand-light)'
                    e.currentTarget.style.borderRadius = '8px'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                  {abbr}
                </div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  margin: '0 auto',
                  background: isDayWorked // Prioritize simple day worked log
                    ? '#4caf50' // Green for worked day (explicit color instead of CSS variable)
                    : (hasScheduledWorkout
                        ? (isScheduledCompleted
                            ? 'linear-gradient(135deg, #ff8fb3 0%, #ff6b9d 100%)' 
                            : 'linear-gradient(135deg, #ff8fb3 0%, #ff6b9d 100%)')
                        : 'transparent'),
                  border: (hasScheduledWorkout || isDayWorked) 
                    ? 'none' 
                    : '2px solid var(--border)',
                  boxShadow: isDayWorked 
                    ? '0 2px 6px rgba(76, 175, 80, 0.5)' 
                    : (hasScheduledWorkout 
                        ? '0 2px 4px rgba(168,85,247,.3)' 
                        : 'none'),
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  transform: isDayWorked ? 'scale(1.1)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (hasScheduledWorkout || isDayWorked) {
                    e.target.style.transform = 'scale(1.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasScheduledWorkout || isDayWorked) {
                    e.target.style.transform = 'scale(1)';
                  }
                }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Summary - Count both scheduled workouts completed AND days marked as worked */}
      {(() => {
        // Count scheduled workouts that are completed
        const completedScheduled = schedule.filter(s => s.completed).length
        
        // Count days marked as worked in this week (that are not already in scheduled workouts)
        const monday = getMonday(currentWeek)
        let daysWorkedCount = 0
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(monday)
          dayDate.setDate(dayDate.getDate() + i)
          const dayDateStr = formatDateLocal(dayDate)
          
          // Check if this day is marked as worked
          if (workoutLogs[dayDateStr] === true) {
            // Check if this day also has a scheduled workout that's completed
            // If not, count it as a separate workout
            const daySchedules = getDaySchedule(i)
            const hasCompletedScheduled = daySchedules.some(s => s.completed)
            
            // Only count if there's no completed scheduled workout for this day
            // OR if the scheduled workout is not completed but the day is marked as worked
            if (!hasCompletedScheduled) {
              daysWorkedCount++
            }
          }
        }
        
        // Total workouts = completed scheduled + days worked (that aren't already counted)
        const totalCompleted = completedScheduled + daysWorkedCount
        
        // Total possible = scheduled workouts + days that could be worked
        // For simplicity, we'll show completed / total scheduled, or completed / 7 if no scheduled
        const totalScheduled = schedule.length
        const totalPossible = totalScheduled > 0 ? totalScheduled : 7 // If no scheduled, show out of 7 days
        
        return (
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1.25rem',
            background: 'linear-gradient(135deg, rgba(196,132,252,0.1) 0%, rgba(168,85,247,0.05) 100%)',
            borderRadius: '16px',
            border: '2px solid var(--border)',
            boxShadow: '0 2px 8px rgba(0,0,0,.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📊</span>
                <small style={{ color: 'var(--fg)', fontWeight: '600', fontSize: '0.95rem' }}>
                  Weekly Summary
                </small>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.25rem'
              }}>
                <span style={{ 
                  fontWeight: '700',
                  fontSize: '1.25rem',
                  background: totalCompleted > 0 
                    ? 'var(--gradient-purple)'
                    : 'var(--text-secondary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {totalCompleted}
                </span>
                <span style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  / {totalPossible}
                </span>
              </div>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'var(--border)', 
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                width: `${Math.min((totalCompleted / totalPossible) * 100, 100)}%`,
                height: '100%',
                background: totalCompleted > 0 
                  ? 'var(--gradient-purple)'
                  : 'var(--border)',
                transition: 'width 0.5s ease',
                borderRadius: '10px',
                boxShadow: totalCompleted > 0 ? '0 2px 6px rgba(168,85,247,.3)' : 'none'
              }} />
            </div>
            <small style={{ 
              color: 'var(--text-secondary)', 
              display: 'block',
              fontSize: '0.85rem'
            }}>
              {totalCompleted === 0 
                ? 'No workouts completed yet this week'
                : totalCompleted === 1
                ? '1 workout completed this week'
                : `${totalCompleted} workouts completed this week`
              }
            </small>
          </div>
        )
      })()}
    </Card>
  )
}

