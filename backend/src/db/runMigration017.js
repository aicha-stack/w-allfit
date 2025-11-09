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

  const migrationFile = path.join(__dirname, "migrations", "017_daily_moods.sql");
  
  if (!fs.existsSync(migrationFile)) {
    console.error(`✗ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  try {
    const sql = fs.readFileSync(migrationFile, "utf8");
    console.log(`\nRunning migration: 017_daily_moods.sql`);
    await db.query(sql);
    console.log("✓ Migration executed successfully!");
    console.log("  Created table: daily_moods");
    process.exit(0);
  } catch (err) {
    console.error("✗ Migration failed:", err.message);
    // If table already exists, that's okay
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      console.log("  (Table may already exist - this is okay)");
      process.exit(0);
    }
    process.exit(1);
  }
}

runMigration();

