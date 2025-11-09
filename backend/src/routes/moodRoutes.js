import express from 'express'
import { createMood, getTodayMood, getMoodHistory } from '../models/moodModel.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Get today's mood
router.get('/today', protect, async (req, res) => {
  try {
    const mood = await getTodayMood(req.user.id)
    res.json({ mood })
  } catch (error) {
    console.error('Error fetching today mood:', error)
    res.status(500).json({ error: 'Failed to fetch mood' })
  }
})

// Create or update today's mood
router.post('/', protect, async (req, res) => {
  try {
    const { mood_type, message } = req.body

    if (!mood_type) {
      return res.status(400).json({ error: 'Mood type is required' })
    }

    const validMoods = ['happy', 'excited', 'good', 'calm', 'tired', 'sad', 'stressed', 'motivated']
    if (!validMoods.includes(mood_type)) {
      return res.status(400).json({ error: 'Invalid mood type' })
    }

    const mood = await createMood({
      userId: req.user.id,
      moodType: mood_type,
      message: message || null
    })

    res.json({ mood })
  } catch (error) {
    console.error('Error creating mood:', error)
    res.status(500).json({ error: 'Failed to save mood' })
  }
})

// Get mood history
router.get('/history', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30
    const moods = await getMoodHistory(req.user.id, limit)
    res.json({ moods })
  } catch (error) {
    console.error('Error fetching mood history:', error)
    res.status(500).json({ error: 'Failed to fetch mood history' })
  }
})

export default router

