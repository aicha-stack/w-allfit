import db from "../db/index.js";

export const enrollInProgram = async (userId, programId) => {
  // First, ensure the unique constraint exists
  try {
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'enrollments_user_id_program_id_key'
        ) THEN
          ALTER TABLE enrollments 
          ADD CONSTRAINT enrollments_user_id_program_id_key 
          UNIQUE (user_id, program_id);
        END IF;
      END $$;
    `);
  } catch (err) {
    // Constraint might already exist or table might not exist, continue anyway
    console.warn('Could not ensure unique constraint:', err.message);
  }

  // Try with ON CONFLICT first
  try {
    const result = await db.query(
      `INSERT INTO enrollments (user_id, program_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, program_id) DO NOTHING
       RETURNING *`,
      [userId, programId]
    );
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    // If no row returned, check if already enrolled
    const existing = await db.query(
      `SELECT * FROM enrollments WHERE user_id = $1 AND program_id = $2`,
      [userId, programId]
    );
    if (existing.rows.length > 0) {
      return { message: "Already enrolled" };
    }
    return { message: "Enrollment failed" };
  } catch (err) {
    // If ON CONFLICT fails, fall back to checking manually
    if (err.message.includes('ON CONFLICT')) {
      const existing = await db.query(
        `SELECT * FROM enrollments WHERE user_id = $1 AND program_id = $2`,
        [userId, programId]
      );
      if (existing.rows.length > 0) {
        return { message: "Already enrolled" };
      }
      // Insert without ON CONFLICT
      const result = await db.query(
        `INSERT INTO enrollments (user_id, program_id)
         VALUES ($1, $2)
         RETURNING *`,
        [userId, programId]
      );
      return result.rows[0];
    }
    throw err;
  }
};

export const unenrollFromProgram = async (userId, programId) => {
  await db.query(
    `DELETE FROM enrollments WHERE user_id = $1 AND program_id = $2`,
    [userId, programId]
  );
  return { message: "Unenrolled successfully" };
};

export const updateEnrollmentProgress = async (userId, programId, progress) => {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }
  
  // First, ensure progress column exists
  try {
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='enrollments' AND column_name='progress'
        ) THEN
          ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);
  } catch (err) {
    console.warn('Could not ensure progress column:', err.message);
  }
  
  const result = await db.query(
    `UPDATE enrollments 
     SET progress = $1
     WHERE user_id = $2 AND program_id = $3
     RETURNING *`,
    [progress, userId, programId]
  );
  if (result.rows.length === 0) {
    throw new Error("Enrollment not found");
  }
  return result.rows[0];
};

export const getEnrollmentsByUser = async (userId) => {
  // Check if columns exist
  let hasProgress = false;
  let hasCreatedAt = false;
  let hasImageUrl = false;
  
  try {
    const colCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='enrollments' 
      AND column_name IN ('progress', 'created_at')
    `);
    const columns = colCheck.rows.map(r => r.column_name);
    hasProgress = columns.includes('progress');
    hasCreatedAt = columns.includes('created_at');
    
    // Check if image_url exists in programs table
    const programColCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='programs' 
      AND column_name='image_url'
    `);
    hasImageUrl = programColCheck.rows.length > 0;
  } catch {
    // If check fails, assume columns don't exist
  }

  const progressSelect = hasProgress ? 'e.progress,' : '0 as progress,';
  const createdAtSelect = hasCreatedAt ? 'e.created_at AS enrolled_at' : 'NOW() AS enrolled_at';
  const orderBy = hasCreatedAt ? 'e.created_at DESC' : 'e.id DESC';
  const imageSelect = hasImageUrl ? 'p.image_url,' : 'NULL as image_url,';
  
  const result = await db.query(
    `SELECT p.id, p.title, p.description, p.duration, ${imageSelect} p.created_at,
            e.id AS enrollment_id,
            ${progressSelect}
            ${createdAtSelect}
     FROM enrollments e
     JOIN programs p ON p.id = e.program_id
     WHERE e.user_id = $1
     ORDER BY ${orderBy}`,
    [userId]
  );
  return result.rows;
};


