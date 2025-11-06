import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import ProgramImage from './ui/ProgramImage.jsx'
import TodayWorkout from './TodayWorkout.jsx'

export default function WorkoutSection() {
  const { token } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('today')
  const [workoutType, setWorkoutType] = useState('all')
  const [refreshTodayWorkout, setRefreshTodayWorkout] = useState(0) // Counter to trigger refresh

  useEffect(() => {
    if (token) {
      loadEnrollments()
    }
  }, [token])

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API_URL}/api/enrollments/me`, 
        { 
          headers: apiHeaders(token),
          timeout: 10000
        }
      )
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load enrollments:', err)
      console.error('Error response:', err.response)
      // Handle authentication errors (interceptor will handle redirect)
      if (err.response?.status === 401 || err.response?.status === 403) {
        return
      }
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  const workoutTypes = ['all', 'cardio', 'strength', 'mobility', 'hiit']

  return (
    <div>
      {/* Sub Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {['Today', 'My Programs', 'Browse'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab.toLowerCase().replace(' ', ''))}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeSubTab === tab.toLowerCase().replace(' ', '') ? 'var(--gradient-purple)' : 'transparent',
              color: activeSubTab === tab.toLowerCase().replace(' ', '') ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: activeSubTab === tab.toLowerCase().replace(' ', '') ? '600' : '500',
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSubTab === 'today' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>💪 Today's Workout</h3>
          <TodayWorkout key={refreshTodayWorkout} refreshTrigger={refreshTodayWorkout} />
        </div>
      )}

      {activeSubTab === 'myprograms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>🏋️ My Programs</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {workoutTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setWorkoutType(type)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: workoutType === type ? 'var(--gradient-purple)' : 'var(--brand-light)',
                    color: workoutType === type ? 'white' : 'var(--brand)',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="note">Loading programs...</div>
          ) : enrollments.length > 0 ? (
            <div className="grid">
              {enrollments.map(e => (
                <Card key={e.enrollment_id} style={{ background: 'var(--card-soft)' }}>
                  <ProgramImage 
                    src={e.image_url} 
                    alt={e.title}
                    height="180px"
                    style={{ marginBottom: '1rem', borderRadius: '16px' }}
                  />
                  <h4 style={{ marginBottom: '0.5rem' }}>{e.title}</h4>
                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    background: 'var(--border)', 
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: `${e.progress || 0}%`,
                      height: '100%',
                      background: 'var(--gradient-purple)',
                      transition: 'width 0.5s ease',
                      borderRadius: '10px'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Progress: {e.progress || 0}%
                    </small>
                    {e.duration && (
                      <small style={{ color: 'var(--text-secondary)' }}>
                        📅 {e.duration} days
                      </small>
                    )}
                  </div>
                  <Link to={`/programs/${e.id}`} style={{ textDecoration: 'none' }}>
                    <Button style={{ width: '100%', fontSize: '0.875rem' }}>
                      Continue Program →
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💪</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No Active Programs</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Start your fitness journey by enrolling in a program!
              </p>
              <Link to="/programs">
                <Button>Browse Programs</Button>
              </Link>
            </Card>
          )}
        </div>
      )}

      {activeSubTab === 'browse' && (
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>🔍 Browse Workouts</h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/programs">
              <Button style={{ fontSize: '1rem', padding: '1rem 2rem' }}>
                🌟 Explore All Programs
              </Button>
            </Link>
          </div>
          <div className="grid">
            {[
              { 
                name: 'Morning Cardio', 
                type: 'CARDIO', 
                duration: '20 min', 
                image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
                description: 'Start your day with energizing cardio exercises'
              },
              { 
                name: 'Full Body Strength', 
                type: 'STRENGTH', 
                duration: '45 min', 
                image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
                description: 'Build strength with full body exercises'
              },
              { 
                name: 'Yoga Flow', 
                type: 'YOGA', 
                duration: '30 min', 
                image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
                description: 'Relax and stretch with a calming yoga session'
              },
              { 
                name: 'HIIT Blast', 
                type: 'HIIT', 
                duration: '25 min', 
                image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
                description: 'High intensity interval training for maximum results'
              }
            ].map((workout, index) => (
              <Card key={index} style={{ background: 'var(--card-soft)' }}>
                <ProgramImage 
                  src={workout.image_url} 
                  alt={workout.name}
                  height="180px"
                  style={{ marginBottom: '1rem', borderRadius: '16px' }}
                />
                <h4 style={{ marginBottom: '0.5rem' }}>{workout.name}</h4>
                {workout.description && (
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)', 
                    marginBottom: '0.75rem',
                    lineHeight: '1.5'
                  }}>
                    {workout.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span style={{
                    padding: '0.3rem 0.6rem',
                    background: 'var(--brand-light)',
                    color: 'var(--brand)',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.75rem'
                  }}>
                    {workout.type}
                  </span>
                  <span>⏱️ {workout.duration}</span>
                </div>
                <Button 
                  onClick={async () => {
                    try {
                      // Get today's date in local format
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = String(now.getMonth() + 1).padStart(2, '0');
                      const day = String(now.getDate()).padStart(2, '0');
                      const today = `${year}-${month}-${day}`;
                      
                      console.log('WorkoutSection: Creating workout for today:', today);
                      
                      // Create workout schedule for today
                      // Include duration in notes so TodayWorkout can parse it
                      const notesWithDuration = `${workout.description || ''} (Duration: ${workout.duration})`.trim()
                      const response = await axios.post(`${API_URL}/api/planner`, {
                        scheduled_date: today,
                        workout_type: workout.type,
                        workout_name: workout.name,
                        notes: notesWithDuration
                      }, {
                        headers: apiHeaders(token),
                        timeout: 10000
                      });
                      
                      console.log('WorkoutSection: Workout scheduled successfully:', response.data);
                      console.log('WorkoutSection: Scheduled date in response:', response.data?.scheduled_date);
                      
                      // Trigger refresh of TodayWorkout component with auto-start FIRST
                      setRefreshTodayWorkout(prev => prev + 1);
                      
                      // Switch to Today tab to show the new workout
                      setActiveSubTab('today');
                      
                      // Wait a bit longer to ensure the component has loaded and timer started, then show message
                      setTimeout(() => {
                        alert(`✅ ${workout.name} started! The timer is running. Good luck! 💪`);
                      }, 2000);
                    } catch (err) {
                      console.error('Failed to start workout:', err);
                      console.error('Error response:', err.response);
                      // Handle authentication errors (interceptor will handle redirect)
                      if (err.response?.status === 401 || err.response?.status === 403) {
                        return;
                      }
                      alert(err.response?.data?.error || 'Failed to schedule workout. Please try again.');
                    }
                  }}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  ▶ Start Workout
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

