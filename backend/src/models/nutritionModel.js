import db from "../db/index.js";

// Get or create nutrition log for a date
export const getOrCreateNutritionLog = async (userId, date = null) => {
  const logDate = date || new Date().toISOString().split('T')[0];
  
  let result = await db.query(
    `SELECT * FROM nutrition_logs WHERE user_id = $1 AND log_date = $2`,
    [userId, logDate]
  );
  
  if (result.rows.length === 0) {
    result = await db.query(
      `INSERT INTO nutrition_logs (user_id, log_date) 
       VALUES ($1, $2) 
       RETURNING *`,
      [userId, logDate]
    );
  }
  
  return result.rows[0];
};

// Update nutrition log
export const updateNutritionLog = async (userId, date, { calories, protein_g, carbs_g, fat_g }) => {
  const logDate = date || new Date().toISOString().split('T')[0];
  
  const result = await db.query(
    `UPDATE nutrition_logs 
     SET calories = COALESCE($1, calories),
         protein_g = COALESCE($2, protein_g),
         carbs_g = COALESCE($3, carbs_g),
         fat_g = COALESCE($4, fat_g)
     WHERE user_id = $5 AND log_date = $6
     RETURNING *`,
    [calories, protein_g, carbs_g, fat_g, userId, logDate]
  );
  
  if (result.rows.length === 0) {
    // Create if doesn't exist
    return await getOrCreateNutritionLog(userId, logDate);
  }
  
  return result.rows[0];
};

// Get nutrition logs for a date range
export const getNutritionLogs = async (userId, startDate, endDate) => {
  const result = await db.query(
    `SELECT * FROM nutrition_logs 
     WHERE user_id = $1 AND log_date BETWEEN $2 AND $3
     ORDER BY log_date DESC`,
    [userId, startDate, endDate]
  );
  return result.rows;
};

// Get or create nutrition goals
export const getNutritionGoals = async (userId) => {
  let result = await db.query(
    `SELECT * FROM nutrition_goals WHERE user_id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    // Create default goals
    result = await db.query(
      `INSERT INTO nutrition_goals (user_id, daily_calories, protein_percent, carbs_percent, fat_percent)
       VALUES ($1, 2000, 30, 40, 30)
       RETURNING *`,
      [userId]
    );
  }
  
  return result.rows[0];
};

// Update nutrition goals
export const updateNutritionGoals = async (userId, { daily_calories, protein_percent, carbs_percent, fat_percent }) => {
  const result = await db.query(
    `UPDATE nutrition_goals 
     SET daily_calories = COALESCE($1, daily_calories),
         protein_percent = COALESCE($2, protein_percent),
         carbs_percent = COALESCE($3, carbs_percent),
         fat_percent = COALESCE($4, fat_percent),
         updated_at = NOW()
     WHERE user_id = $5
     RETURNING *`,
    [daily_calories, protein_percent, carbs_percent, fat_percent, userId]
  );
  
  if (result.rows.length === 0) {
    // Create if doesn't exist
    return await getNutritionGoals(userId);
  }
  
  return result.rows[0];
};

