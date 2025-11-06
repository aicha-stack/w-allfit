import db from "../db/index.js";

// Mark day as worked out
export const markDayWorked = async (userId, workoutDate) => {
  try {
    // Normalize date to YYYY-MM-DD format (remove timezone)
    const normalizedDate = workoutDate.split('T')[0];
    
    // Try with updated_at first (if column exists)
    const result = await db.query(
      `INSERT INTO workout_logs (user_id, workout_date, completed)
       VALUES ($1, $2::date, true)
       ON CONFLICT (user_id, workout_date)
       DO UPDATE SET completed = true, updated_at = NOW()
       RETURNING id, user_id, workout_date::text as workout_date, completed, notes, created_at, updated_at`,
      [userId, normalizedDate]
    );
    
    // Normalize the returned date
    if (result.rows[0]) {
      result.rows[0].workout_date = result.rows[0].workout_date.split('T')[0];
    }
    return result.rows[0];
  } catch (err) {
    // If updated_at doesn't exist, try without it
    if (err.message.includes('updated_at')) {
      const normalizedDate = workoutDate.split('T')[0];
      const result = await db.query(
        `INSERT INTO workout_logs (user_id, workout_date, completed)
         VALUES ($1, $2::date, true)
         ON CONFLICT (user_id, workout_date)
         DO UPDATE SET completed = true
         RETURNING id, user_id, workout_date::text as workout_date, completed, notes, created_at`,
        [userId, normalizedDate]
      );
      
      // Normalize the returned date
      if (result.rows[0]) {
        result.rows[0].workout_date = result.rows[0].workout_date.split('T')[0];
      }
      return result.rows[0];
    }
    throw err;
  }
};

// Unmark day - delete the log entry instead of setting completed to false
export const unmarkDayWorked = async (userId, workoutDate) => {
  try {
    // Normalize date to YYYY-MM-DD format (remove timezone)
    const normalizedDate = workoutDate.split('T')[0];
    
    // Delete the workout log entry completely
    const result = await db.query(
      `DELETE FROM workout_logs 
       WHERE user_id = $1 AND workout_date = $2::date
       RETURNING *`,
      [userId, normalizedDate]
    );
    // If no rows were deleted, the log doesn't exist - that's okay, just return success
    if (result.rows.length === 0) {
      return { message: 'Workout log not found, nothing to unmark' };
    }
    return { message: 'Workout log deleted successfully', deleted: true };
  } catch (err) {
    console.error('Error unmarking day worked:', err);
    throw err;
  }
};

// Get workout logs for a date range - only return completed logs
export const getWorkoutLogs = async (userId, startDate, endDate) => {
  // Normalize dates to YYYY-MM-DD format
  const normalizedStartDate = startDate.split('T')[0];
  const normalizedEndDate = endDate.split('T')[0];
  
  // Use explicit boolean comparison - PostgreSQL boolean can be tricky
  // Also handle NULL values explicitly
  // Cast workout_date to text to avoid timezone issues
  const result = await db.query(
    `SELECT id, user_id, workout_date::text as workout_date, completed, notes, created_at, updated_at
     FROM workout_logs
     WHERE user_id = $1 
     AND workout_date >= $2::date
     AND workout_date <= $3::date
     AND completed IS NOT NULL
     AND completed = true
     ORDER BY workout_date DESC`,
    [userId, normalizedStartDate, normalizedEndDate]
  );
  
  // Normalize all dates to YYYY-MM-DD format (remove timezone)
  const normalizedLogs = result.rows.map(log => {
    if (log.workout_date) {
      log.workout_date = log.workout_date.split('T')[0];
    }
    return log;
  });
  
  // Double filter in JavaScript to be absolutely sure (in case SQL filter doesn't work)
  const filteredLogs = normalizedLogs.filter(log => {
    const isCompleted = log.completed === true || log.completed === 'true' || log.completed === 1;
    return isCompleted;
  });
  
  return filteredLogs;
};

// Get workout log for specific date
export const getWorkoutLogByDate = async (userId, workoutDate) => {
  const result = await db.query(
    `SELECT * FROM workout_logs
     WHERE user_id = $1 AND workout_date = $2`,
    [userId, workoutDate]
  );
  return result.rows[0] || null;
};

