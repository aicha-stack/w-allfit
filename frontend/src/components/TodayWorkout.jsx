import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import ProgramImage from './ui/ProgramImage.jsx'

export default function TodayWorkout({ refreshTrigger }) {
  const { token } = useAuth()
  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isStarted, setIsStarted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0) // in seconds
  const [workoutDuration, setWorkoutDuration] = useState(0) // in seconds
  const timerRef = useRef(null)

  // Track previous refreshTrigger to detect new workouts
  const prevRefreshTriggerRef = useRef(0)

  useEffect(() => {
    if (token) {
      console.log('TodayWorkout: useEffect triggered, loading workout...', { refreshTrigger, token: !!token });
      // Auto-start if refreshTrigger increased (meaning a new workout was just created)
      const isNewWorkout = refreshTrigger > prevRefreshTriggerRef.current
      prevRefreshTriggerRef.current = refreshTrigger
      loadTodayWorkout(isNewWorkout)
    }
  }, [token, refreshTrigger])

  // Parse duration string (e.g., "20 min" -> 20 minutes in seconds)
  const parseDuration = (durationStr) => {
    if (!durationStr) return 0
    const match = durationStr.match(/(\d+)\s*(min|minute|minutes|hour|hours|h|m)/i)
    if (match) {
      const value = parseInt(match[1], 10)
      const unit = match[2].toLowerCase()
      if (unit.includes('hour') || unit === 'h') {
        return value * 60 * 60 // Convert hours to seconds
      } else {
        return value * 60 // Convert minutes to seconds
      }
    }
    return 0
  }

  const loadTodayWorkout = async (autoStart = false) => {
    try {
      setLoading(true)
      console.log('TodayWorkout: Loading today workout...')
      const { data } = await axios.get(`${API_URL}/api/planner/today`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      console.log('TodayWorkout: Received data:', data)
      if (data && !data.message) {
        console.log('TodayWorkout: Setting workout:', data)
        const wasCompleted = workout?.completed
        setWorkout(data)
        
        // Extract duration from notes (format: "... (Duration: 20 min)")
        let durationStr = '30 min' // Default to 30 min
        if (data.notes) {
          const durationMatch = data.notes.match(/\(Duration:\s*([^)]+)\)/i)
          if (durationMatch) {
            durationStr = durationMatch[1].trim()
          } else {
            // Try to parse duration directly from notes
            durationStr = data.notes
          }
        }
        const duration = parseDuration(durationStr)
        const finalDuration = duration || 30 * 60 // Default to 30 minutes if parsing fails
        
        console.log('TodayWorkout: Parsed duration:', {
          originalNotes: data.notes,
          durationStr,
          parsedDuration: duration,
          finalDuration,
          finalDurationMinutes: finalDuration / 60
        })
        
        // Set duration first
        setWorkoutDuration(finalDuration)
        
        // Reset timer state when loading a new workout
        if (!data.completed) {
          setIsStarted(false)
          setTimeElapsed(0)
        }
        
        // If workout is marked as completed but we just created it, try to reset it
        // If reset fails (404), just force start anyway
        if (data.completed && autoStart) {
          console.log('TodayWorkout: Workout is marked completed but should be new, attempting reset...')
          // Try to reset completed status by calling the API
          axios.put(`${API_URL}/api/planner/${data.id}/reset`, {},
            { 
              headers: apiHeaders(token),
              timeout: 10000
            }
          ).then(() => {
            console.log('TodayWorkout: Workout reset, reloading...')
            loadTodayWorkout(true) // Reload with auto-start
          }).catch(err => {
            console.warn('TodayWorkout: Reset endpoint not available (backend may need restart), forcing start anyway')
            // Force start even if completed is true when autoStart is true
            setTimeout(() => {
              console.log('TodayWorkout: Forcing auto-start despite completed status')
              if (finalDuration > 0) {
                // Temporarily set completed to false to allow start
                setWorkout(prev => prev ? { ...prev, completed: false } : prev)
                setTimeout(() => {
                  startWorkout()
                }, 200)
              }
            }, 1500)
          })
        } else if (!data.completed && autoStart && !isStarted && finalDuration > 0) {
          console.log('TodayWorkout: Auto-starting workout timer', { 
            completed: data.completed, 
            autoStart, 
            isStarted,
            duration: finalDuration 
          })
          // Use a longer delay to ensure all state is properly set
          setTimeout(() => {
            console.log('TodayWorkout: Actually starting workout now, duration:', finalDuration)
            // Double-check duration before starting
            if (finalDuration > 0) {
              startWorkout()
            } else {
              console.error('TodayWorkout: Cannot auto-start, invalid duration')
            }
          }, 1500) // Increased delay to ensure state is set
        } else {
          console.log('TodayWorkout: Not auto-starting', { 
            completed: data.completed, 
            autoStart, 
            isStarted,
            duration: finalDuration
          })
        }
      } else {
        console.log('TodayWorkout: No workout found (message:', data?.message, ')')
        setWorkout(null)
        setIsStarted(false)
        setTimeElapsed(0)
        stopWorkout()
      }
    } catch (err) {
      console.error('TodayWorkout: Failed to load today workout:', err)
      console.error('TodayWorkout: Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setWorkout(null)
      setIsStarted(false)
      setTimeElapsed(0)
      stopWorkout()
    } finally {
      setLoading(false)
    }
  }

  const markComplete = async (showMessage = false) => {
    if (!workout) return
    stopWorkout() // Stop timer when completing
    try {
      await axios.put(`${API_URL}/api/planner/${workout.id}/complete`, {},
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      // Show success message if requested
      if (showMessage) {
        alert('🎉 Great job! You finished your workout! 💪✨')
      }
      // Reload to update the workout state
      await loadTodayWorkout()
    } catch (err) {
      console.error('Failed to mark workout as complete:', err)
      console.error('Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      alert(err.response?.data?.error || 'Failed to mark as complete')
    }
  }

  // Start workout timer
  const startWorkout = () => {
    // Use a ref to get the latest workout state
    const currentWorkout = workout
    const currentDuration = workoutDuration
    
    console.log('startWorkout called', { 
      isStarted, 
      workout: !!currentWorkout, 
      completed: currentWorkout?.completed,
      workoutDuration: currentDuration,
      currentTimeElapsed: timeElapsed
    })
    
    if (isStarted) {
      console.log('startWorkout: Already started')
      return
    }
    
    if (!currentWorkout) {
      console.log('startWorkout: No workout available, waiting...')
      // Wait a bit and try again if workout is being loaded
      setTimeout(() => {
        if (workout) {
          startWorkout()
        }
      }, 500)
      return
    }
    
    // Allow starting even if completed is true (for force start scenarios)
    // But check if it's really completed by checking if we have a valid duration
    if (currentWorkout.completed && currentDuration <= 0) {
      console.log('startWorkout: Cannot start - workout completed and no duration')
      return
    }
    
    // Check if duration is valid
    if (!currentDuration || currentDuration <= 0) {
      console.error('startWorkout: Invalid duration', currentDuration)
      alert('⚠️ Cannot start workout: Duration not set. Please check the workout details.')
      return
    }
    
    console.log('startWorkout: Starting timer with duration', currentDuration, 'seconds')
    setIsStarted(true)
    setTimeElapsed(0) // Reset to 0 when starting
    
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1
        
        // Log every 10 seconds to avoid spam
        if (newTime % 10 === 0) {
          console.log('Timer tick:', newTime, '/', currentDuration)
        }
        
        // Auto-complete when duration is reached
        if (currentDuration > 0 && newTime >= currentDuration) {
          console.log('startWorkout: Duration reached, completing workout', { newTime, currentDuration })
          stopWorkout()
          // Use setTimeout to avoid state update issues
          setTimeout(() => {
            markComplete(true) // Show success message
          }, 100)
          return currentDuration
        }
        return newTime
      })
    }, 1000)
    console.log('startWorkout: Timer started successfully')
  }

  // Stop workout timer
  const stopWorkout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsStarted(false)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate progress percentage
  const getProgress = () => {
    if (workoutDuration === 0) return workout?.completed ? 100 : 0
    if (workout?.completed) return 100
    return Math.min((timeElapsed / workoutDuration) * 100, 100)
  }

  if (loading) {
    return (
      <Card style={{ background: 'var(--card-soft)' }}>
        <div className="note" style={{ textAlign: 'center', padding: '2rem' }}>
          Loading today's workout...
        </div>
      </Card>
    )
  }

  if (!workout) {
    return (
      <Card style={{ background: 'var(--card-soft)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Today's Workout</h3>
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💪</div>
          <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>No workout scheduled for today</p>
          <small>Schedule a workout in your planner to get started!</small>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/programs">
              <Button style={{ fontSize: '0.875rem', padding: '0.75rem 1.5rem' }}>
                Browse Programs
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const workoutProgress = getProgress()

  return (
    <Card style={{ background: 'var(--card-soft)' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💪</span>
        <span>Today's Workout</span>
      </h3>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        {workout.program_image && (
          <ProgramImage 
            src={workout.program_image} 
            alt={workout.workout_name || workout.program_title}
            height="120px"
            style={{ marginBottom: '0.5rem' }}
          />
        )}
        {/* Start/Pause Button Overlay */}
        {!workout.completed && (
          <button
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: isStarted ? 'var(--success)' : 'var(--gradient-purple)',
              border: '3px solid white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isStarted ? '1.2rem' : '1.8rem',
              boxShadow: '0 4px 16px rgba(168,85,247,.4)',
              transition: 'all 0.3s ease',
              color: 'white'
            }}
            onClick={isStarted ? stopWorkout : startWorkout}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(168,85,247,.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translate(-50%, -50%) scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(168,85,247,.4)';
            }}
          >
            {isStarted ? '⏸' : '▶'}
          </button>
        )}
      </div>
      
      {/* Modern Timer Display - Circular Progress Timer */}
      {!workout.completed && workoutDuration > 0 && (
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(196,132,252,0.05) 100%)',
          borderRadius: '24px',
          border: '2px solid rgba(168,85,247,0.2)',
          overflow: 'hidden'
        }}>
          {/* Animated background glow */}
          {isStarted && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              pointerEvents: 'none'
            }} />
          )}
          
          {/* Circular Progress Ring */}
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            marginBottom: '1.5rem'
          }}>
            {/* SVG Circle for progress */}
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id={`purpleGradient-${workout.id || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="rgba(168,85,247,0.2)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke={`url(#purpleGradient-${workout.id || 'default'})`}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - workoutProgress / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 0.5s ease',
                  filter: isStarted ? 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' : 'none'
                }}
              />
            </svg>
            
            {/* Timer text in center */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              width: '100%'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                background: 'var(--gradient-purple)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.2',
                marginBottom: '0.25rem',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {formatTime(timeElapsed)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                opacity: 0.8
              }}>
                / {formatTime(workoutDuration)}
              </div>
              {isStarted && (
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent-purple)',
                  marginTop: '0.5rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  animation: 'pulse 2s infinite'
                }}>
                  <span>●</span>
                  <span>Running</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress percentage and status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            justifyContent: 'center'
          }}>
            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(168,85,247,0.15)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--accent-purple)'
            }}>
              {Math.round(workoutProgress)}% Complete
            </div>
            {!isStarted && (
              <div style={{
                padding: '0.5rem 1rem',
                background: 'rgba(196,132,252,0.1)',
                borderRadius: '12px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                Ready to start
              </div>
            )}
          </div>
        </div>
      )}
      <h4 style={{ marginBottom: '0.5rem' }}>{workout.workout_name || workout.program_title || 'Fat Burn'}</h4>
      {/* Progress Bar */}
      <div style={{ 
        width: '100%', 
        height: '10px', 
        background: 'var(--border)', 
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '0.75rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,.05)'
      }}>
        <div style={{
          width: `${workoutProgress}%`,
          height: '100%',
              background: 'var(--gradient-purple)',
          transition: 'width 0.5s ease',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(168,85,247,.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.3), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <small style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
          💪 {workoutProgress}% Complete
        </small>
        {workoutProgress === 100 && (
          <span style={{ fontSize: '1.2rem' }}>✨</span>
        )}
      </div>
      {workout.workout_type && (
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '0.4rem 0.8rem',
              background: 'var(--gradient-purple)',
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '600',
            boxShadow: '0 2px 6px rgba(168,85,247,.3)'
          }}>
            {workout.workout_type}
          </span>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        {workout.program_id && (
          <Link to={`/programs/${workout.program_id}`} style={{ flex: '1', textDecoration: 'none' }}>
            <Button style={{ width: '100%', fontSize: '0.875rem' }}>
              📖 View Program
            </Button>
          </Link>
        )}
        {!workout.completed && (
          <Button 
            onClick={markComplete} 
            style={{ 
              flex: '1',
              fontSize: '0.875rem',
              background: 'var(--success)',
              border: 'none'
            }}
          >
            ✓ Complete
          </Button>
        )}
      </div>
      
      {workout.completed && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: 'linear-gradient(135deg, #a8e6cf 0%, #7dd3a0 100%)', 
          color: 'white',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: '600',
          boxShadow: '0 2px 8px rgba(168,230,207,.4)'
        }}>
          ✨ Workout Completed! Great job!
        </div>
      )}
    </Card>
  )
}

