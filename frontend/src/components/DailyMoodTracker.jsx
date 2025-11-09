import { useState, useEffect } from 'react'
import Card from './ui/Card.jsx'
import { API_URL, apiHeaders, useAuth } from '../hooks/useAuth.jsx'
import axios from 'axios'

const moods = [
  { id: 'happy', emoji: '😊', label: 'Heureux', color: '#fbbf24' },
  { id: 'excited', emoji: '🎉', label: 'Excité', color: '#f59e0b' },
  { id: 'good', emoji: '😌', label: 'Bien', color: '#10b981' },
  { id: 'calm', emoji: '🧘', label: 'Calme', color: '#3b82f6' },
  { id: 'tired', emoji: '😴', label: 'Fatigué', color: '#6366f1' },
  { id: 'sad', emoji: '😢', label: 'Triste', color: '#8b5cf6' },
  { id: 'stressed', emoji: '😰', label: 'Stressé', color: '#ef4444' },
  { id: 'motivated', emoji: '💪', label: 'Motivé', color: '#ec4899' }
]

const messages = {
  happy: [
    "C'est fantastique de vous voir si heureux ! Continuez sur cette lancée positive ! 🌟",
    "Votre bonheur est contagieux ! Profitez de cette belle journée ! ✨",
    "Quelle énergie positive ! Vous êtes sur la bonne voie ! 💫",
    "Votre sourire illumine tout ! Gardez cette belle énergie ! 🌈"
  ],
  excited: [
    "Votre enthousiasme est électrisant ! Préparez-vous à accomplir de grandes choses ! 🚀",
    "Cette excitation est le carburant de vos succès ! Allez-y ! 💥",
    "Vous êtes prêt à conquérir le monde ! Profitez de cette énergie ! ⚡",
    "Votre passion est inspirante ! Utilisez-la pour atteindre vos objectifs ! 🔥"
  ],
  good: [
    "Vous êtes sur la bonne voie ! Continuez à prendre soin de vous ! 💚",
    "C'est parfait ! Chaque jour est une nouvelle opportunité de progresser ! 🌱",
    "Vous faites du bon travail ! Soyez fier de vos efforts ! 🌟",
    "Votre bien-être est important ! Continuez à écouter votre corps ! ✨"
  ],
  calm: [
    "Votre sérénité est une force ! Profitez de cette paix intérieure ! 🧘",
    "Cette tranquillité vous aide à rester centré et concentré ! 🌊",
    "Vous êtes en harmonie avec vous-même ! C'est magnifique ! 💙",
    "Votre calme est une source de force ! Utilisez-le pour avancer ! 🌸"
  ],
  tired: [
    "Prenez le temps de vous reposer ! Votre corps vous remerciera ! 😴",
    "Le repos est aussi important que l'effort ! Écoutez votre corps ! 💤",
    "Une pause bien méritée vous aidera à revenir plus fort ! 🌙",
    "Prenez soin de vous aujourd'hui ! Demain sera un nouveau jour ! ⭐"
  ],
  sad: [
    "Les jours difficiles passent aussi. Vous êtes plus fort que vous ne le pensez ! 💙",
    "Il est normal de se sentir ainsi. Prenez soin de vous aujourd'hui ! 🌸",
    "Chaque émotion est valide. Vous n'êtes pas seul dans ce moment ! 🤗",
    "Demain apportera de nouvelles perspectives. En attendant, soyez doux avec vous-même ! 🌅"
  ],
  stressed: [
    "Respirez profondément ! Vous pouvez gérer cette situation ! 💨",
    "Prenez un moment pour vous. Vous méritez cette pause ! 🧘",
    "Les défis sont temporaires. Vous avez la force de les surmonter ! 💪",
    "Un pas à la fois. Vous y arriverez ! 🌟"
  ],
  motivated: [
    "Cette motivation est votre super-pouvoir ! Utilisez-la pour atteindre vos objectifs ! 💪",
    "Vous êtes prêt à donner le meilleur de vous-même ! Allez-y ! 🚀",
    "Votre détermination est inspirante ! Rien ne peut vous arrêter ! ⚡",
    "Cette énergie positive vous mènera loin ! Profitez-en ! 🔥"
  ]
}

export default function DailyMoodTracker() {
  const { token, user } = useAuth()
  const [selectedMood, setSelectedMood] = useState(null)
  const [todayMood, setTodayMood] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      loadTodayMood()
    }
  }, [token])

  const loadTodayMood = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mood/today`, {
        headers: apiHeaders(token)
      })
      if (res.data.mood) {
        setTodayMood(res.data.mood)
        setSelectedMood(res.data.mood.mood_type)
        setMessage(res.data.mood.message || getRandomMessage(res.data.mood.mood_type))
      }
    } catch (err) {
      // No mood set today, that's okay
      console.log('No mood set today')
    }
  }

  const getRandomMessage = (moodType) => {
    const moodMessages = messages[moodType] || messages.good
    return moodMessages[Math.floor(Math.random() * moodMessages.length)]
  }

  const handleMoodSelect = async (moodId) => {
    if (selectedMood === moodId && todayMood) {
      return // Already selected today
    }

    setLoading(true)
    setSelectedMood(moodId)
    const randomMessage = getRandomMessage(moodId)

    try {
      const res = await axios.post(
        `${API_URL}/api/mood`,
        {
          mood_type: moodId,
          message: randomMessage
        },
        { headers: apiHeaders(token) }
      )
      setTodayMood(res.data.mood)
      setMessage(randomMessage)
    } catch (err) {
      console.error('Error saving mood:', err)
      // Still show message even if save fails
      setMessage(randomMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedMoodData = moods.find(m => m.id === selectedMood)

  return (
    <Card style={{
      background: 'var(--card)',
      border: '1.5px solid var(--border)',
      marginBottom: '1.5rem'
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>💭</span>
          <span>Comment vous sentez-vous aujourd'hui ?</span>
        </h3>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '0.9rem',
          margin: 0
        }}>
          Partagez votre humeur et recevez un message personnalisé
        </p>
      </div>

      {/* Mood Selection */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}
      className="mood-selection-grid"
      >
        {moods.map(mood => {
          const isSelected = selectedMood === mood.id
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                background: isSelected 
                  ? `linear-gradient(135deg, ${mood.color} 0%, ${mood.color}dd 100%)`
                  : 'var(--card-soft)',
                border: `2px solid ${isSelected ? mood.color : 'var(--border)'}`,
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '80px',
                opacity: loading && !isSelected ? 0.5 : 1,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected 
                  ? `0 4px 12px ${mood.color}40`
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected && !loading) {
                  e.target.style.background = `linear-gradient(135deg, ${mood.color}20 0%, ${mood.color}10 100%)`
                  e.target.style.borderColor = mood.color
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected && !loading) {
                  e.target.style.background = 'var(--card-soft)'
                  e.target.style.borderColor = 'var(--border)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{mood.emoji}</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: isSelected ? '600' : '500',
                color: isSelected ? 'white' : 'var(--fg)'
              }}>
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Message Display */}
      {message && selectedMood && (
        <div style={{
          padding: '1.25rem',
          background: selectedMoodData 
            ? `linear-gradient(135deg, ${selectedMoodData.color}15 0%, ${selectedMoodData.color}08 100%)`
            : 'var(--card-soft)',
          border: `1.5px solid ${selectedMoodData ? `${selectedMoodData.color}40` : 'var(--border)'}`,
          borderRadius: '16px',
          animation: 'fadeIn 0.5s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{selectedMoodData?.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{
                margin: 0,
                color: 'var(--fg)',
                fontSize: '1rem',
                lineHeight: 1.6,
                fontWeight: 500
              }}>
                {message}
              </p>
              {todayMood && (
                <p style={{
                  margin: '0.75rem 0 0 0',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontStyle: 'italic'
                }}>
                  Enregistré aujourd'hui à {new Date(todayMood.created_at).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!selectedMood && (
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          Sélectionnez votre humeur pour recevoir un message personnalisé
        </div>
      )}
    </Card>
  )
}

