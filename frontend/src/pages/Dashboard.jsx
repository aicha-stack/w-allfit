import { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import ProgramImage from '../components/ui/ProgramImage.jsx'
import NutritionTracker from '../components/NutritionTracker.jsx'
import WeeklyPlanner from '../components/WeeklyPlanner.jsx'
import TodayWorkout from '../components/TodayWorkout.jsx'
import NutritionSection from '../components/NutritionSection.jsx'
import WorkoutSection from '../components/WorkoutSection.jsx'
import PlannerSection from '../components/PlannerSection.jsx'
import CommunitySection from '../components/CommunitySection.jsx'

export default function Dashboard() {
  const { token, user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingProgress, setUpdatingProgress] = useState(null)
  const [progressValue, setProgressValue] = useState('')
  const [activeMainTab, setActiveMainTab] = useState('dashboard')
  const [activeActivityTab, setActiveActivityTab] = useState('activity')
  const [favorites, setFavorites] = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(false)

  useEffect(() => {
    if (token) {
      loadEnrollments()
      if (activeActivityTab === 'favorites') {
        loadFavorites()
      }
    } else {
      setLoading(false)
    }
  }, [token, activeActivityTab])

  const loadEnrollments = () => {
    setLoading(true)
    setError('')
    axios.get(`${API_URL}/api/enrollments/me`, { headers: apiHeaders(token) })
      .then(({ data }) => {
        console.log('Enrollments loaded:', data)
        setEnrollments(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Failed to load enrollments:', err)
        setError(err.response?.data?.error || 'Failed to load your programs')
        setEnrollments([])
      })
      .finally(() => setLoading(false))
  }

  const updateProgress = async (programId, currentProgress) => {
    const newProgress = parseInt(progressValue, 10)
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      alert('Progress must be a number between 0 and 100')
      return
    }
    setUpdatingProgress(programId)
    try {
      await axios.put(`${API_URL}/api/enrollments/${programId}/progress`, 
        { progress: newProgress },
        { headers: apiHeaders(token) }
      )
      setProgressValue('')
      setUpdatingProgress(null)
      loadEnrollments()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update progress')
      setUpdatingProgress(null)
    }
  }

  const startUpdateProgress = (programId, currentProgress) => {
    setUpdatingProgress(programId)
    setProgressValue(String(currentProgress))
  }

  const cancelUpdateProgress = () => {
    setUpdatingProgress(null)
    setProgressValue('')
  }

  const loadFavorites = async () => {
    if (!token) return
    setLoadingFavorites(true)
    try {
      const { data } = await axios.get(`${API_URL}/api/favorites`, { headers: apiHeaders(token) })
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load favorites:', err)
      setFavorites([])
    } finally {
      setLoadingFavorites(false)
    }
  }

  const toggleFavorite = async (programId) => {
    if (!token) return
    try {
      const { data } = await axios.post(
        `${API_URL}/api/favorites/${programId}/toggle`,
        {},
        { headers: apiHeaders(token) }
      )
      // Reload favorites after toggle
      await loadFavorites()
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      alert(err.response?.data?.error || 'Failed to update favorite')
    }
  }

  if (loading) return <div className="note">Loading your programs...</div>

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0

  // Get tab display info
  const getTabInfo = (tab) => {
    const tabs = {
      dashboard: { title: 'Dashboard', subtitle: 'Your Fitness Hub' },
      workout: { title: 'Workout', subtitle: 'Training & Exercises' },
      nutrition: { title: 'Nutrition', subtitle: 'Meals & Recipes' },
      planner: { title: 'Planner', subtitle: 'Schedule & Planning' },
      community: { title: 'Community', subtitle: 'Connect & Share' }
    }
    return tabs[tab] || tabs.dashboard
  }

  const currentTabInfo = getTabInfo(activeMainTab)

  return (
    <div>
      {/* Header Section - Changes based on active tab */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ 
              marginBottom: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.75rem'
            }}>
              <span className="emoji-medium">{currentTabInfo.icon}</span>
              <span>{currentTabInfo.title}</span>
            </h2>
            <p style={{ 
              color: 'var(--text-secondary)', 
              marginBottom: 0,
              fontSize: '0.95rem',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {activeMainTab === 'dashboard' ? (
                <>
                  <span className="emoji">👋</span>
                  <span>Hey{user ? `, ${user.name}` : ''}! <span className="emoji"></span> Your Fitness Hub: Everything You Need at a Glance</span>
                </>
              ) : (
                <>
                  <span className="emoji">{currentTabInfo.icon}</span>
                  <span>{currentTabInfo.subtitle}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Main Navigation Tabs - Always show */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '1.5rem',
          borderBottom: '2px solid var(--border)',
          paddingBottom: '0.75rem',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {[
            { name: 'Dashboard' },
            { name: 'Workout' },
            { name: 'Nutrition' },
            { name: 'Planner'},
            { name: 'Community' }
          ].map(tab => {
            const tabKey = tab.name.toLowerCase()
            const isActive = activeMainTab === tabKey
            return (
              <button
                key={tab.name}
                onClick={() => setActiveMainTab(tabKey)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: isActive ? 'var(--gradient-purple)' : 'transparent',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.95rem',
                  position: 'relative',
                  boxShadow: isActive ? 'var(--shadow-soft)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'var(--brand-light)';
                    e.target.style.color = 'var(--brand)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span className="emoji">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area - Only show on Dashboard tab */}
      {activeMainTab === 'dashboard' && (
        <>
          {/* Top Section: Nutrition & Weekly Planner */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            {/* Nutrition Tracker */}
            <NutritionTracker />
            
            {/* Weekly Planner */}
            <WeeklyPlanner />
          </div>

          {/* Today's Workout and Activity Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            {/* Today's Workout */}
            <TodayWorkout />
            
            {/* Activity/Favorites Section */}
            <Card style={{ background: 'var(--card-soft)' }}>
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '1.5rem', 
                borderBottom: '2px solid var(--border)', 
                paddingBottom: '0.75rem' 
              }}>
                <button
                  onClick={() => setActiveActivityTab('activity')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: activeActivityTab === 'activity' ? 'var(--gradient-purple)' : 'transparent',
                    color: activeActivityTab === 'activity' ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: activeActivityTab === 'activity' ? '600' : '500',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (activeActivityTab !== 'activity') {
                      e.target.style.background = 'var(--brand-light)';
                      e.target.style.color = 'var(--brand)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeActivityTab !== 'activity') {
                      e.target.style.background = 'transparent';
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveActivityTab('favorites')}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: activeActivityTab === 'favorites' ? 'var(--gradient-purple)' : 'transparent',
                    color: activeActivityTab === 'favorites' ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: activeActivityTab === 'favorites' ? '600' : '500',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => {
                    if (activeActivityTab !== 'favorites') {
                      e.target.style.background = 'var(--brand-light)';
                      e.target.style.color = 'var(--brand)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeActivityTab !== 'favorites') {
                      e.target.style.background = 'transparent';
                      e.target.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  Favorites
                </button>
              </div>
              
              {activeActivityTab === 'activity' && (
                <div>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--fg)' }}>💪 My Program</h4>
                  {enrollments.length > 0 ? (
                    enrollments.slice(0, 1).map(e => (
                      <div key={e.enrollment_id} style={{ 
                        padding: '1.25rem', 
                        background: 'var(--card)', 
                        borderRadius: '16px',
                        border: '1.5px solid var(--border)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(el) => {
                        el.currentTarget.style.transform = 'translateY(-2px)';
                        el.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                        el.currentTarget.style.borderColor = 'var(--brand-light)';
                      }}
                      onMouseLeave={(el) => {
                        el.currentTarget.style.transform = 'translateY(0)';
                        el.currentTarget.style.boxShadow = 'none';
                        el.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      >
                        <h5 style={{ marginBottom: '0.75rem', color: 'var(--fg)' }}>{e.title || 'Glu\'Core'}</h5>
                        <div style={{ 
                          width: '100%', 
                          height: '8px', 
                          background: 'var(--border)', 
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{
                            width: `${e.progress || 0}%`,
                            height: '100%',
                            background: 'var(--gradient-purple)',
                            transition: 'width 0.5s ease',
                            borderRadius: '10px'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Progress: {e.progress || 0}%
                          </small>
                          <Link to={`/programs/${e.id}`} style={{ 
                            color: 'var(--brand)', 
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateX(4px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      padding: '2rem', 
                      background: 'var(--card)', 
                      borderRadius: '16px',
                      border: '1.5px solid var(--border)',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💪</div>
                      <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Glu'Core</p>
                      <small>No active program yet</small>
                      <div style={{ marginTop: '1rem' }}>
                        <Link to="/programs">
                          <Button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                            Browse Programs
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
                  {activeActivityTab === 'favorites' && (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--fg)' }}>⭐ My Favorites</h4>
                      {loadingFavorites ? (
                        <div className="note" style={{ textAlign: 'center', padding: '2rem' }}>
                          Loading favorites...
                        </div>
                      ) : favorites.length > 0 ? (
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                          {favorites.map(fav => (
                            <Card key={fav.program_id} style={{
                              background: 'var(--card)',
                              border: '1.5px solid var(--border)',
                              transition: 'all 0.3s ease',
                              position: 'relative'
                            }}
                              onMouseEnter={(el) => {
                                el.currentTarget.style.transform = 'translateY(-2px)'
                                el.currentTarget.style.boxShadow = 'var(--shadow-soft)'
                                el.currentTarget.style.borderColor = 'var(--brand-light)'
                              }}
                              onMouseLeave={(el) => {
                                el.currentTarget.style.transform = 'translateY(0)'
                                el.currentTarget.style.boxShadow = 'none'
                                el.currentTarget.style.borderColor = 'var(--border)'
                              }}
                            >
                              {/* Remove Favorite Button */}
                              <button
                                onClick={() => toggleFavorite(fav.program_id)}
                                style={{
                                  position: 'absolute',
                                  top: '0.5rem',
                                  right: '0.5rem',
                                  background: 'var(--gradient-purple)',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  zIndex: 10,
                                  boxShadow: '0 2px 6px rgba(168,85,247,.3)',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'scale(1.1)'
                                  e.target.style.boxShadow = '0 4px 10px rgba(168,85,247,.5)'
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)'
                                  e.target.style.boxShadow = '0 2px 6px rgba(168,85,247,.3)'
                                }}
                                title="Remove from favorites"
                              >
                                ⭐
                              </button>
                              <Link to={`/programs/${fav.program_id}`} style={{ textDecoration: 'none' }}>
                                <ProgramImage
                                  src={fav.image_url}
                                  alt={fav.title}
                                  height="150px"
                                  style={{ marginBottom: '0.75rem', borderRadius: '12px' }}
                                />
                                <h5 style={{ marginBottom: '0.5rem', color: 'var(--fg)' }}>{fav.title}</h5>
                                {fav.description && (
                                  <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {fav.description}
                                  </p>
                                )}
                                {fav.duration && (
                                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                                    📅 {fav.duration} days
                                  </small>
                                )}
                              </Link>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Your favorite programs will appear here
                          </p>
                          <Link to="/programs">
                            <Button style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                              Discover Programs
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
            </Card>
          </div>
        </>
      )}
      
      {/* Overall Progress - Only show on dashboard tab */}
      {activeMainTab === 'dashboard' && enrollments.length > 0 && (
        <Card style={{ 
          marginBottom: '2rem', 
          background: 'var(--card-soft)',
          border: '1.5px solid var(--border)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}> Overall Progress</h3>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              background: 'var(--gradient-purple)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {totalProgress}%
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '16px', 
            background: 'var(--border)', 
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '0.75rem',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,.05)'
          }}>
            <div style={{
              width: `${totalProgress}%`,
              height: '100%',
              background: 'var(--gradient-purple)',
              transition: 'width 0.5s ease',
              borderRadius: '12px',
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
          <small style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
            Average progress across {enrollments.length} program{enrollments.length !== 1 ? 's' : ''}
          </small>
        </Card>
      )}

      {/* Your Programs Section - Only show on dashboard tab */}
      {activeMainTab === 'dashboard' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}> Your Programs</h3>
            {enrollments.length > 0 && (
              <Link to="/programs" style={{ 
                color: 'var(--brand)', 
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                Browse More →
              </Link>
            )}
          </div>
      {enrollments.length ? (
        <div className="grid">
          {enrollments.map(e => (
            <Card key={e.enrollment_id} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%',
              background: 'var(--card-soft)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(el) => {
              el.currentTarget.style.transform = 'translateY(-4px)';
              el.currentTarget.style.boxShadow = 'var(--shadow-soft)';
            }}
            onMouseLeave={(el) => {
              el.currentTarget.style.transform = 'translateY(0)';
              el.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
            >
              <ProgramImage 
                src={e.image_url} 
                alt={e.title}
                height="180px"
                style={{ marginBottom: '1rem', borderRadius: '16px' }}
              />
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--fg)' }}>{e.title}</h4>
              {e.description ? (
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: '0.75rem',
                  lineHeight: '1.6',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.9rem'
                }}>
                  {e.description}
                </p>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  Aucune description disponible
                </p>
              )}
              {e.duration && (
                <small style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  📅 Durée: {e.duration} jours
                </small>
              )}
              
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <small><strong>Progress</strong></small>
                  <small>{e.progress || 0}%</small>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '12px', 
                  background: 'var(--border)', 
                  borderRadius: '10px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,.05)'
                }}>
                  <div style={{
                    width: `${e.progress || 0}%`,
                    height: '100%',
                    background: 'var(--gradient-purple)',
                    transition: 'width 0.5s ease',
                    borderRadius: '10px',
                    boxShadow: '0 2px 6px rgba(168,85,247,.4)',
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
                
                {updatingProgress === e.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(ev) => setProgressValue(ev.target.value)}
                      style={{ 
                        flex: '1',
                        minWidth: '80px',
                        padding: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    />
                    <Button 
                      onClick={() => updateProgress(e.id, e.progress)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.875rem',
                        flex: '1',
                        minWidth: '70px'
                      }}
                    >
                      ✓ Save
                    </Button>
                    <Button 
                      onClick={cancelUpdateProgress}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        fontSize: '0.875rem',
                        background: 'var(--card-soft)',
                        color: 'var(--fg)',
                        border: '1.5px solid var(--border)',
                        flex: '1',
                        minWidth: '70px'
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => startUpdateProgress(e.id, e.progress || 0)}
                    style={{ 
                      width: '100%', 
                      marginTop: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    ✏️ Update Progress
                  </Button>
                )}
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Link to={`/programs/${e.id}`} style={{ textDecoration: 'none' }}>
                  <Button style={{ width: '100%' }}>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          {error && (
            <Card style={{ 
              background: '#ffebee', 
              border: '1.5px solid #ffcdd2',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: '#d32f2f', fontWeight: '500' }}>
                 {error}
              </div>
            </Card>
          )}
          <Card style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            background: 'var(--card-soft)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💪</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Start Your Fitness Journey</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Browse our personalized programs and enroll to get started on your fitness journey!
            </p>
            <Link to="/programs" style={{ textDecoration: 'none' }}>
              <Button style={{ 
                padding: '1rem 2rem',
                fontSize: '1rem'
              }}>
                 Browse Programs
              </Button>
            </Link>
          </Card>
        </div>
      )}
        </>
      )}

      {/* Other tabs content with clear headers */}
      {activeMainTab === 'nutrition' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span></span>
              <span>Nutrition & Recipes</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Track your meals, discover recipes, and manage your nutrition goals
            </p>
          </div>
          <NutritionSection />
        </div>
      )}

      {activeMainTab === 'workout' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span></span>
              <span>Workout & Training</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Start your workouts, track your progress, and explore new exercises
            </p>
          </div>
          <WorkoutSection />
        </div>
      )}

      {activeMainTab === 'planner' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📅</span>
              <span>Workout Planner</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Schedule your workouts, plan your week, and stay organized
            </p>
          </div>
          <PlannerSection />
        </div>
      )}

      {activeMainTab === 'community' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👥</span>
              <span>Community</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Connect with others, share your progress, and join challenges
            </p>
          </div>
          <CommunitySection />
        </div>
      )}
    </div>
  )
}


