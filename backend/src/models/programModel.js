import db from "../db/index.js";

// Helper to check if image_url column exists
let imageUrlColumnExistsCache = null;

const imageUrlColumnExists = async () => {
  if (imageUrlColumnExistsCache !== null) {
    return imageUrlColumnExistsCache;
  }
  
  try {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='programs' AND column_name='image_url'
    `);
    imageUrlColumnExistsCache = result.rows.length > 0;
    return imageUrlColumnExistsCache;
  } catch {
    imageUrlColumnExistsCache = false;
    return false;
  }
};

// Créer un programme
export const createProgram = async ({ title, description, duration, image_url }) => {
  const hasImageUrl = await imageUrlColumnExists();
  
  if (hasImageUrl) {
    const result = await db.query(
      `INSERT INTO programs (title, description, duration, image_url) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description, duration, image_url]
    );
    return result.rows[0];
  } else {
    const result = await db.query(
      `INSERT INTO programs (title, description, duration) 
       VALUES ($1, $2, $3) RETURNING *`,
      [title, description, duration]
    );
    return result.rows[0];
  }
};

// Récupérer tous les programmes
export const getAllPrograms = async () => {
  try {
    // Try to select with image_url first
    const result = await db.query(`
      SELECT id, title, description, duration, created_at, 
             COALESCE(image_url, NULL) as image_url
      FROM programs 
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (err) {
    // If image_url column doesn't exist, select without it
    if (err.message.includes('image_url') || err.message.includes('column')) {
      const result = await db.query(`
        SELECT id, title, description, duration, created_at
        FROM programs 
        ORDER BY created_at DESC
      `);
      // Add null image_url to each row
      return result.rows.map(row => ({ ...row, image_url: null }));
    }
    throw err;
  }
};

// Récupérer un programme par ID
export const getProgramById = async (id) => {
  try {
    const result = await db.query(`
      SELECT id, title, description, duration, created_at, 
             COALESCE(image_url, NULL) as image_url
      FROM programs 
      WHERE id = $1
    `, [id]);
    return result.rows[0];
  } catch (err) {
    // If image_url column doesn't exist, select without it
    if (err.message.includes('image_url') || err.message.includes('column')) {
      const result = await db.query(`
        SELECT id, title, description, duration, created_at
        FROM programs 
        WHERE id = $1
      `, [id]);
      if (result.rows[0]) {
        return { ...result.rows[0], image_url: null };
      }
      return null;
    }
    throw err;
  }
};

// Mettre à jour un programme
export const updateProgram = async (id, { title, description, duration, image_url }) => {
  const hasImageUrl = await imageUrlColumnExists();
  
  if (hasImageUrl) {
    const result = await db.query(
      `UPDATE programs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           duration = COALESCE($3, duration),
           image_url = COALESCE($4, image_url)
       WHERE id = $5
       RETURNING *`,
      [title, description, duration, image_url, id]
    );
    if (result.rows.length === 0) throw new Error("Programme non trouvé");
    return result.rows[0];
  } else {
    const result = await db.query(
      `UPDATE programs 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           duration = COALESCE($3, duration)
       WHERE id = $4
       RETURNING id, title, description, duration, created_at, NULL as image_url`,
      [title, description, duration, id]
    );
    if (result.rows.length === 0) throw new Error("Programme non trouvé");
    return result.rows[0];
  }
};

// Supprimer un programme
export const deleteProgram = async (id) => {
  await db.query("DELETE FROM programs WHERE id = $1", [id]);
  return { message: "Programme supprimé avec succès" };
};
