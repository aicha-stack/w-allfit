import db from "../db/index.js";

// Cache for role column existence check
let roleColumnExistsCache = null;

// Helper to check if role column exists (cached)
const roleColumnExists = async () => {
  if (roleColumnExistsCache !== null) {
    return roleColumnExistsCache;
  }
  
  try {
    const result = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='role'
    `);
    roleColumnExistsCache = result.rows.length > 0;
    return roleColumnExistsCache;
  } catch {
    roleColumnExistsCache = false;
    return false;
  }
};

export const createUser = async ({ name, email, password }) => {
  const hasRole = await roleColumnExists();
  const roleSelect = hasRole ? 'role' : "'user' as role";
  
  const result = await db.query(
    `INSERT INTO users (name, email, password) 
     VALUES ($1, $2, $3) 
     RETURNING id, name, email, ${roleSelect}, created_at`,
    [name, email, password]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const hasRole = await roleColumnExists();
  const roleSelect = hasRole ? 'role' : "'user' as role";
  
  const result = await db.query(
    `SELECT id, name, email, password, ${roleSelect}, created_at 
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

export const getUserById = async (id) => {
  const hasRole = await roleColumnExists();
  const roleSelect = hasRole ? 'role' : "'user' as role";
  
  const result = await db.query(
    `SELECT id, name, email, ${roleSelect}, created_at 
     FROM users WHERE id = $1`, 
    [id]
  );
  return result.rows[0];
};

export const updateUser = async (id, { name, email }) => {
  const hasRole = await roleColumnExists();
  const roleSelect = hasRole ? 'role' : "'user' as role";
  
  const result = await db.query(
    `UPDATE users 
     SET name = COALESCE($1, name),
         email = COALESCE($2, email)
     WHERE id = $3
     RETURNING id, name, email, ${roleSelect}, created_at`,
    [name, email, id]
  );
  if (result.rows.length === 0) throw new Error("Utilisateur non trouvé");
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await db.query("SELECT id, name, email FROM users");
  return result.rows;
};
