import db from "../db/index.js";

// Get weekly schedule
export const getWeeklySchedule = async (userId, startDate) => {
  // If startDate is very old (like 2020-01-01), return ALL workouts
  // Otherwise, get workouts for the week (7 days from startDate)
  const isAllTime = startDate && startDate < '2021-01-01';
  
  let query, params;
  
  if (isAllTime) {
    // Get ALL workouts for the user
    query = `SELECT ws.*, p.title as program_title, p.image_url as program_image
             FROM workout_schedule ws
             LEFT JOIN programs p ON p.id = ws.program_id
             WHERE ws.user_id = $1
             ORDER BY COALESCE(ws.scheduled_date, '1970-01-01'::date), ws.day_of_week`;
    params = [userId];
  } else {
    // Get workouts for the week (7 days from startDate)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    query = `SELECT ws.*, p.title as program_title, p.image_url as program_image
             FROM workout_schedule ws
             LEFT JOIN programs p ON p.id = ws.program_id
             WHERE ws.user_id = $1 
             AND (
               (ws.scheduled_date IS NOT NULL AND ws.scheduled_date >= $2 AND ws.scheduled_date <= $3)
               OR (ws.scheduled_date IS NULL AND ws.day_of_week IS NOT NULL)
             )
             ORDER BY COALESCE(ws.scheduled_date, '1970-01-01'::date), ws.day_of_week`;
    params = [userId, startDate, endDateStr];
  }
  
  const result = await db.query(query, params);
  return result.rows;
};

// Create or update workout schedule
export const upsertWorkoutSchedule = async (userId, { day_of_week, scheduled_date, program_id, enrollment_id, workout_type, workout_name, notes }) => {
  // Clean up the data: convert empty strings to null, ensure integers are numbers
  const cleanDayOfWeek = day_of_week === '' || day_of_week === null || day_of_week === undefined 
    ? null 
    : (typeof day_of_week === 'string' ? parseInt(day_of_week, 10) : day_of_week);
  
  // Normalize scheduled_date to YYYY-MM-DD format (remove timezone if present)
  let cleanScheduledDate = scheduled_date === '' ? null : scheduled_date;
  if (cleanScheduledDate && typeof cleanScheduledDate === 'string') {
    cleanScheduledDate = cleanScheduledDate.split('T')[0].split(' ')[0];
  }
  
  const cleanProgramId = program_id === '' || program_id === null || program_id === undefined 
    ? null 
    : (typeof program_id === 'string' ? parseInt(program_id, 10) : program_id);
  const cleanEnrollmentId = enrollment_id === '' || enrollment_id === null || enrollment_id === undefined 
    ? null 
    : (typeof enrollment_id === 'string' ? parseInt(enrollment_id, 10) : enrollment_id);
  const cleanWorkoutType = workout_type === '' ? null : workout_type;
  const cleanWorkoutName = workout_name === '' ? null : workout_name;
  const cleanNotes = notes === '' ? null : notes;

  console.log(`upsertWorkoutSchedule: Creating/updating workout for user ${userId}`, {
    day_of_week: cleanDayOfWeek,
    scheduled_date: cleanScheduledDate,
    workout_name: cleanWorkoutName,
    workout_type: cleanWorkoutType
  });

  // Validate: either day_of_week OR scheduled_date must be provided
  if (cleanDayOfWeek === null && cleanScheduledDate === null) {
    throw new Error('Either day_of_week or scheduled_date must be provided');
  }

  // Validate day_of_week if provided
  if (cleanDayOfWeek !== null && (isNaN(cleanDayOfWeek) || cleanDayOfWeek < 0 || cleanDayOfWeek > 6)) {
    throw new Error('Day of week must be a number between 0 and 6');
  }

  // Validate program_id if provided
  if (cleanProgramId !== null && isNaN(cleanProgramId)) {
    throw new Error('Program ID must be a valid number');
  }

  // Use a workaround for ON CONFLICT with NULL values
  // PostgreSQL's ON CONFLICT doesn't work well with NULLs in unique constraints
  // So we'll use a different approach: check if exists, then insert or update
  const existing = await db.query(
    `SELECT id FROM workout_schedule 
     WHERE user_id = $1 
     AND (day_of_week = $2 OR ($2 IS NULL AND day_of_week IS NULL))
     AND (scheduled_date = $3::date OR ($3 IS NULL AND scheduled_date IS NULL))`,
    [userId, cleanDayOfWeek, cleanScheduledDate]
  );

  console.log(`upsertWorkoutSchedule: Found ${existing.rows.length} existing workout(s)`);

  let result;
  if (existing.rows.length > 0) {
    // Update existing - reset completed to false when updating (new workout session)
    console.log(`upsertWorkoutSchedule: Updating existing workout ${existing.rows[0].id}`);
    result = await db.query(
      `UPDATE workout_schedule 
       SET program_id = COALESCE($1, program_id),
           enrollment_id = COALESCE($2, enrollment_id),
           workout_type = COALESCE($3, workout_type),
           workout_name = COALESCE($4, workout_name),
           notes = COALESCE($5, notes),
           completed = false
       WHERE id = $6
       RETURNING *`,
      [cleanProgramId, cleanEnrollmentId, cleanWorkoutType, cleanWorkoutName, cleanNotes, existing.rows[0].id]
    );
  } else {
    // Insert new - completed defaults to false
    console.log(`upsertWorkoutSchedule: Inserting new workout`);
    result = await db.query(
      `INSERT INTO workout_schedule 
       (user_id, day_of_week, scheduled_date, program_id, enrollment_id, workout_type, workout_name, notes, completed)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8, false)
       RETURNING *`,
      [userId, cleanDayOfWeek, cleanScheduledDate, cleanProgramId, cleanEnrollmentId, cleanWorkoutType, cleanWorkoutName, cleanNotes]
    );
  }
  
  console.log(`upsertWorkoutSchedule: Successfully created/updated workout:`, {
    id: result.rows[0].id,
    scheduled_date: result.rows[0].scheduled_date,
    workout_name: result.rows[0].workout_name
  });
  
  return result.rows[0];
};

// Mark workout as completed
export const completeWorkout = async (id, userId) => {
  const result = await db.query(
    `UPDATE workout_schedule 
     SET completed = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  if (result.rows.length === 0) throw new Error("Workout schedule not found");
  return result.rows[0];
};

// Reset workout (uncomplete it)
export const resetWorkout = async (id, userId) => {
  const result = await db.query(
    `UPDATE workout_schedule 
     SET completed = false
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  if (result.rows.length === 0) throw new Error("Workout schedule not found");
  return result.rows[0];
};

// Delete workout schedule
export const deleteWorkoutSchedule = async (id, userId) => {
  const result = await db.query(
    `DELETE FROM workout_schedule 
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  if (result.rows.length === 0) throw new Error("Workout schedule not found");
  return { message: "Workout schedule deleted" };
};

// Get today's workout
export const getTodayWorkout = async (userId) => {
  // Use local date formatting to avoid timezone issues
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const mondayDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0 format
  
  console.log(`getTodayWorkout: Looking for workout for user ${userId} on date ${today} (day of week: ${mondayDay})`);
  
  // First, try to find workout by scheduled_date (most specific)
  // Use explicit date casting to ensure proper comparison
  const result = await db.query(
    `SELECT ws.*, p.title as program_title, p.image_url as program_image, p.description as program_description
     FROM workout_schedule ws
     LEFT JOIN programs p ON p.id = ws.program_id
     WHERE ws.user_id = $1 
     AND (
       (ws.scheduled_date IS NOT NULL AND ws.scheduled_date::date = $2::date)
       OR (ws.scheduled_date IS NULL AND ws.day_of_week = $3)
     )
     ORDER BY 
       CASE WHEN ws.scheduled_date IS NOT NULL AND ws.scheduled_date::date = $2::date THEN 1 ELSE 2 END,
       ws.scheduled_date DESC NULLS LAST
     LIMIT 1`,
    [userId, today, mondayDay]
  );
  
  console.log(`getTodayWorkout: Found ${result.rows.length} workout(s)`);
  if (result.rows.length > 0) {
    console.log(`getTodayWorkout: Workout details:`, {
      id: result.rows[0].id,
      workout_name: result.rows[0].workout_name,
      scheduled_date: result.rows[0].scheduled_date,
      day_of_week: result.rows[0].day_of_week
    });
  }
  
  // Normalize the returned date if present
  if (result.rows[0] && result.rows[0].scheduled_date) {
    const dateStr = result.rows[0].scheduled_date;
    if (typeof dateStr === 'string') {
      result.rows[0].scheduled_date = dateStr.split('T')[0].split(' ')[0];
    }
  }
  
  return result.rows[0] || null;
};

