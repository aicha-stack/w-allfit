import db from "../db/index.js";

// Add a program to favorites
export const addFavorite = async (userId, programId) => {
  const result = await db.query(
    `INSERT INTO favorites (user_id, program_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, program_id) DO NOTHING
     RETURNING *`,
    [userId, programId]
  );
  return result.rows[0];
};

// Remove a program from favorites
export const removeFavorite = async (userId, programId) => {
  const result = await db.query(
    `DELETE FROM favorites
     WHERE user_id = $1 AND program_id = $2
     RETURNING *`,
    [userId, programId]
  );
  return result.rows[0];
};

// Get all favorites for a user
export const getUserFavorites = async (userId) => {
  const result = await db.query(
    `SELECT f.*, 
            p.id as program_id,
            p.title,
            p.description,
            p.duration,
            p.image_url,
            p.created_at as program_created_at
     FROM favorites f
     JOIN programs p ON p.id = f.program_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Check if a program is favorited by a user
export const isFavorite = async (userId, programId) => {
  const result = await db.query(
    `SELECT EXISTS(
       SELECT 1 FROM favorites
       WHERE user_id = $1 AND program_id = $2
     ) as is_favorite`,
    [userId, programId]
  );
  return result.rows[0]?.is_favorite || false;
};

// Get favorite status for multiple programs (for a user)
export const getFavoriteStatuses = async (userId, programIds) => {
  if (!programIds || programIds.length === 0) {
    return {};
  }
  
  const result = await db.query(
    `SELECT program_id
     FROM favorites
     WHERE user_id = $1 AND program_id = ANY($2::int[])`,
    [userId, programIds]
  );
  
  const statusMap = {};
  programIds.forEach(id => {
    statusMap[id] = false;
  });
  
  result.rows.forEach(row => {
    statusMap[row.program_id] = true;
  });
  
  return statusMap;
};

