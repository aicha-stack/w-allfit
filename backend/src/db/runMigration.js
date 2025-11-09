import fs from "fs";
import path from "path";
import url from "url";
import db from "./index.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    // Test database connection
    await db.query("SELECT NOW()");
    console.log("✓ Database connection successful");
  } catch (err) {
    console.error("✗ Database connection failed!");
    console.error("  Make sure PostgreSQL is running and DATABASE_URL is set correctly in .env");
    console.error("  Error:", err.message);
    process.exit(1);
  }

  const migrationFile = path.join(__dirname, "migrations", "016_user_personal_info.sql");
  
  if (!fs.existsSync(migrationFile)) {
    console.error(`✗ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(migrationFile, "utf8");
    console.log(`\nRunning migration: 016_user_personal_info.sql`);
    await db.query(sql);
    console.log("✓ Migration executed successfully!");
    console.log("  Added columns: weight, height, menstrual_cycle_start_date, menstrual_cycle_duration");
    process.exit(0);
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
    // If columns already exist, that's okay
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      console.log("  (Columns may already exist - this is okay)");
      process.exit(0);
    }
    process.exit(1);
  }
}

runMigration();

