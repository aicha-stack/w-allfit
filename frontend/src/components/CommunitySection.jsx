import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'
import ProgramImage from './ui/ProgramImage.jsx'

export default function CommunitySection() {
  const [activeSubTab, setActiveSubTab] = useState('feed')

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
        {['Feed', 'Challenges', 'Groups'].map(tab => (
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
      {activeSubTab === 'feed' && <FeedTab />}
      {activeSubTab === 'challenges' && <ChallengesTab />}
      {activeSubTab === 'groups' && <GroupsTab />}
    </div>
  )
}

// Feed Tab with Posts, Comments, Reactions
function FeedTab() {
  const { token, user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostForm, setShowPostForm] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [postImageUrl, setPostImageUrl] = useState('')
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentText, setCommentText] = useState({})

  useEffect(() => {
    if (token) {
      loadPosts()
    }
  }, [token])

  const loadPosts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/community/posts`, 
        { headers: apiHeaders(token) }
      )
      setPosts(data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/community/posts`, {
        content: postContent,
        image_url: postImageUrl || null
      }, { headers: apiHeaders(token) })
      setPostContent('')
      setPostImageUrl('')
      setShowPostForm(false)
      loadPosts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create post')
    }
  }

  const handleReaction = async (postId) => {
    try {
      await axios.post(`${API_URL}/api/community/posts/${postId}/reactions`, {},
        { headers: apiHeaders(token) }
      )
      loadPosts()
    } catch (err) {
      console.error('Failed to toggle reaction:', err)
    }
  }

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return
    try {
      await axios.post(`${API_URL}/api/community/posts/${postId}/comments`, {
        content: commentText[postId]
      }, { headers: apiHeaders(token) })
      setCommentText({ ...commentText, [postId]: '' })
      loadPostComments(postId)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add comment')
    }
  }

  const [comments, setComments] = useState({})
  const loadPostComments = async (postId) => {
    try {
      const { data } = await axios.get(`${API_URL}/api/community/posts/${postId}/comments`,
        { headers: apiHeaders(token) }
      )
      setComments({ ...comments, [postId]: data })
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const toggleComments = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!comments[postId]) {
        await loadPostComments(postId)
      }
    }
  }

  if (loading) return <div className="note">Loading posts...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>👥 Community Feed</h3>
        <Button onClick={() => setShowPostForm(!showPostForm)} style={{ fontSize: '0.875rem' }}>
          {showPostForm ? '✕ Cancel' : '+ Share Progress'}
        </Button>
      </div>

      {showPostForm && (
        <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create Post</h4>
          <form onSubmit={handleCreatePost}>
            <label>
              What's on your mind?
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={4}
                required
                style={{
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--card)',
                  fontSize: '0.95rem',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginTop: '0.5rem'
                }}
                placeholder="Share your fitness journey, achievements, or tips..."
              />
            </label>
            <Input
              label="Image URL (optional)"
              type="url"
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ marginTop: '1rem' }}
            />
            {postImageUrl && (
              <div style={{ marginTop: '1rem' }}>
                <ProgramImage src={postImageUrl} alt="Preview" height="150px" />
              </div>
            )}
            <Button type="submit" style={{ marginTop: '1rem' }}>
              ✓ Post
            </Button>
          </form>
        </Card>
      )}

      {posts.length > 0 ? (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {posts.map(post => (
            <Card key={post.id} style={{ background: 'var(--card-soft)' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'var(--gradient-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {post.user_name?.[0]?.toUpperCase() || '👤'}
                </div>
                <div style={{ flex: '1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{post.user_name}</div>
                      <small style={{ color: 'var(--text-secondary)' }}>
                        {new Date(post.created_at).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </small>
                    </div>
                    {post.program_title && (
                      <span style={{ 
                        padding: '0.3rem 0.6rem',
                        background: 'var(--brand-light)',
                        color: 'var(--brand)',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {post.program_title}
                      </span>
                    )}
                  </div>
                  <p style={{ marginBottom: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</p>
                  {post.image_url && (
                    <div style={{ marginBottom: '1rem' }}>
                      <ProgramImage src={post.image_url} alt="Post image" height="300px" />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
                    <button 
                      onClick={() => handleReaction(post.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--brand)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                    >
                      ❤️ {post.reaction_count || 0}
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s',
                        fontWeight: '600'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--brand)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                    >
                      💬 {post.comment_count || 0}
                    </button>
                  </div>

                  {expandedPost === post.id && (
                    <div style={{ 
                      marginTop: '1rem', 
                      paddingTop: '1rem', 
                      borderTop: '1px solid var(--border)' 
                    }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <textarea
                            value={commentText[post.id] || ''}
                            onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            rows={2}
                            style={{
                              flex: '1',
                              padding: '0.5rem 0.75rem',
                              border: '1.5px solid var(--border)',
                              borderRadius: '12px',
                              background: 'var(--card)',
                              fontSize: '0.875rem',
                              fontFamily: 'inherit',
                              resize: 'vertical'
                            }}
                          />
                          <Button 
                            onClick={() => handleComment(post.id)}
                            style={{ alignSelf: 'flex-end', fontSize: '0.875rem' }}
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                      {comments[post.id] && comments[post.id].length > 0 ? (
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {comments[post.id].map(comment => (
                            <div key={comment.id} style={{
                              padding: '0.75rem',
                              background: 'var(--card)',
                              borderRadius: '12px',
                              border: '1px solid var(--border)'
                            }}>
                              <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                {comment.user_name}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {comment.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Be the first to share!</p>
        </Card>
      )}
    </div>
  )
}

// Challenges Tab
function ChallengesTab() {
  const { token } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '💪',
    start_date: '',
    end_date: '',
    goal_type: 'workouts',
    goal_value: ''
  })

  useEffect(() => {
    if (token) {
      loadChallenges()
    }
  }, [token])

  const loadChallenges = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/community/challenges`,
        { headers: apiHeaders(token) }
      )
      setChallenges(data)
    } catch (err) {
      console.error('Failed to load challenges:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (challengeId) => {
    try {
      await axios.post(`${API_URL}/api/community/challenges/${challengeId}/join`, {},
        { headers: apiHeaders(token) }
      )
      loadChallenges()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join challenge')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/community/challenges`, formData,
        { headers: apiHeaders(token) }
      )
      setShowCreateForm(false)
      setFormData({
        name: '', description: '', emoji: '💪', start_date: '', end_date: '', goal_type: 'workouts', goal_value: ''
      })
      loadChallenges()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create challenge')
    }
  }

  if (loading) return <div className="note">Loading challenges...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>🏆 Active Challenges</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} style={{ fontSize: '0.875rem' }}>
          {showCreateForm ? '✕ Cancel' : '+ Create Challenge'}
        </Button>
      </div>

      {showCreateForm && (
        <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create Challenge</h4>
          <form onSubmit={handleCreate} className="form">
            <Input
              label="Challenge Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <Input
                label="Start Date *"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
              <Input
                label="End Date *"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
            <Input
              label="Emoji"
              value={formData.emoji}
              onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
              placeholder="💪"
            />
            <Button type="submit" style={{ marginTop: '0.5rem' }}>
              ✓ Create Challenge
            </Button>
          </form>
        </Card>
      )}

      {challenges.length > 0 ? (
        <div className="grid">
          {challenges.map(challenge => (
            <Card key={challenge.id} style={{ background: 'var(--card-soft)' }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                {challenge.emoji || '💪'}
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>{challenge.name}</h4>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {challenge.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <small style={{ color: 'var(--text-secondary)' }}>
                  👥 {challenge.participant_count || 0} participants
                </small>
              </div>
              <Button 
                onClick={() => handleJoin(challenge.id)}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                Join Challenge
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <p style={{ color: 'var(--text-secondary)' }}>No challenges yet. Create the first one!</p>
        </Card>
      )}
    </div>
  )
}

// Groups Tab
function GroupsTab() {
  const { token } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    is_public: true
  })

  useEffect(() => {
    if (token) {
      loadGroups()
    }
  }, [token])

  const loadGroups = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/community/groups`,
        { headers: apiHeaders(token) }
      )
      setGroups(data)
    } catch (err) {
      console.error('Failed to load groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (groupId) => {
    try {
      await axios.post(`${API_URL}/api/community/groups/${groupId}/join`, {},
        { headers: apiHeaders(token) }
      )
      loadGroups()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join group')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/community/groups`, formData,
        { headers: apiHeaders(token) }
      )
      setShowCreateForm(false)
      setFormData({ name: '', description: '', image_url: '', is_public: true })
      loadGroups()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create group')
    }
  }

  if (loading) return <div className="note">Loading groups...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>👥 Fitness Groups</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} style={{ fontSize: '0.875rem' }}>
          {showCreateForm ? '✕ Cancel' : '+ Create Group'}
        </Button>
      </div>

      {showCreateForm && (
        <Card style={{ marginBottom: '2rem', background: 'var(--card-soft)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Create Group</h4>
          <form onSubmit={handleCreate} className="form">
            <Input
              label="Group Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Button type="submit" style={{ marginTop: '0.5rem' }}>
              ✓ Create Group
            </Button>
          </form>
        </Card>
      )}

      {groups.length > 0 ? (
        <div className="grid">
          {groups.map(group => (
            <Card key={group.id} style={{ background: 'var(--card-soft)' }}>
              {group.image_url && (
                <ProgramImage 
                  src={group.image_url} 
                  alt={group.name}
                  height="150px"
                  style={{ marginBottom: '1rem', borderRadius: '16px' }}
                />
              )}
              <h4 style={{ marginBottom: '0.5rem' }}>{group.name}</h4>
              <p style={{ 
                fontSize: '0.875rem', 
                color: 'var(--text-secondary)', 
                marginBottom: '1rem',
                lineHeight: '1.5'
              }}>
                {group.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <small style={{ color: 'var(--text-secondary)' }}>
                  👥 {group.member_count || 0} members
                </small>
              </div>
              <Button 
                onClick={() => handleJoin(group.id)}
                style={{ width: '100%', fontSize: '0.875rem' }}
              >
                Join Group
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '3rem 2rem', background: 'var(--card-soft)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
          <p style={{ color: 'var(--text-secondary)' }}>No groups yet. Create the first one!</p>
        </Card>
      )}
    </div>
  )
}
