import db from "../db/index.js";

export const createResult = async ({ userId, programId, enrollmentId, workoutDate, notes, completed }) => {
  const result = await db.query(
    `INSERT INTO results (user_id, program_id, enrollment_id, workout_date, notes, completed)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, programId, enrollmentId, workoutDate, notes, completed ?? true]
  );
  return result.rows[0];
};

export const getResultsByUser = async (userId, programId = null) => {
  let query = `
    SELECT r.*, p.title AS program_title
    FROM results r
    JOIN programs p ON p.id = r.program_id
    WHERE r.user_id = $1
  `;
  const params = [userId];
  
  if (programId) {
    query += ` AND r.program_id = $2`;
    params.push(programId);
  }
  
  query += ` ORDER BY r.workout_date DESC, r.created_at DESC`;
  
  const result = await db.query(query, params);
  return result.rows;
};

export const getResultById = async (id, userId) => {
  const result = await db.query(
    `SELECT r.*, p.title AS program_title
     FROM results r
     JOIN programs p ON p.id = r.program_id
     WHERE r.id = $1 AND r.user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
};

export const updateResult = async (id, userId, { workoutDate, notes, completed }) => {
  const result = await db.query(
    `UPDATE results 
     SET workout_date = COALESCE($1, workout_date),
         notes = COALESCE($2, notes),
         completed = COALESCE($3, completed)
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [workoutDate, notes, completed, id, userId]
  );
  if (result.rows.length === 0) throw new Error("Result not found");
  return result.rows[0];
};

export const deleteResult = async (id, userId) => {
  const result = await db.query(
    `DELETE FROM results WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  if (result.rows.length === 0) throw new Error("Result not found");
  return { message: "Result deleted successfully" };
};

