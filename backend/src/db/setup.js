import fs from "fs";
import path from "path";
import url from "url";
import db from "./index.js";
import { ensureAdminUser } from "./seedAdmin.js";
import { ensurePrograms } from "./seedPrograms.js";
import { ensureRecipes } from "./seedRecipes.js";
import { ensureCommunityData } from "./seedCommunity.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  if (!sql.trim()) return;
  try {
    await db.query(sql);
    console.log(`✓ Executed: ${path.basename(filePath)}`);
  } catch (err) {
    console.error(`✗ Error in ${path.basename(filePath)}:`, err.message);
    throw err;
  }
}

async function setup() {
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

  const migrationsDir = path.join(__dirname, "migrations");
  const seedFile = path.join(__dirname, "seed.sql");

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`\nRunning ${files.length} migration(s)...`);
  for (const file of files) {
    await runSqlFile(path.join(migrationsDir, file));
  }

  if (fs.existsSync(seedFile)) {
    console.log("\nRunning seed file...");
    await runSqlFile(seedFile);
  }

  // Ensure admin user exists (JS-based seed)
  console.log("\nSetting up admin user...");
  await ensureAdminUser();

      // Ensure programs exist (JS-based seed)
      console.log("\nSetting up programs...");
      await ensurePrograms();

      // Ensure recipes exist (JS-based seed)
      console.log("\nSetting up recipes...");
      await ensureRecipes();

      // Ensure community data exists (JS-based seed)
      console.log("\nSetting up community data...");
      await ensureCommunityData();

      console.log("\n✓ Database setup completed successfully!");
      process.exit(0);
}

setup().catch((err) => {
  console.error("\n✗ Setup failed:", err.message);
  process.exit(1);
});


