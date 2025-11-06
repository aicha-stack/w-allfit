import bcrypt from "bcrypt";
import db from "./index.js";

export async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@wallfit.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  const existing = await db.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
  if (existing.rows.length) return;

  const hash = await bcrypt.hash(adminPassword, 10);
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
    ["Admin", adminEmail, hash, "admin"]
  );
  console.log(`Seeded admin user: ${adminEmail}`);
}


