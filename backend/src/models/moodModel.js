import db from '../db/index.js'

export const createMood = async ({ userId, moodType, message }) => {
  const result = await db.query(
    `INSERT INTO daily_moods (user_id, mood_type, message, mood_date)
     VALUES ($1, $2, $3, CURRENT_DATE)
     ON CONFLICT (user_id, mood_date)
     DO UPDATE SET mood_type = $2, message = $3, created_at = NOW()
     RETURNING *`,
    [userId, moodType, message]
  )
  return result.rows[0]
}

export const getTodayMood = async (userId) => {
  const result = await db.query(
    `SELECT * FROM daily_moods
     WHERE user_id = $1 AND mood_date = CURRENT_DATE
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  )
  return result.rows[0] || null
}

export const getMoodHistory = async (userId, limit = 30) => {
  const result = await db.query(
    `SELECT * FROM daily_moods
     WHERE user_id = $1
     ORDER BY mood_date DESC
     LIMIT $2`,
    [userId, limit]
  )
  return result.rows
}

