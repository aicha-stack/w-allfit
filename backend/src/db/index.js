import { Pool } from "pg"; // PostgreSQL, sinon mysql2 pour MySQL
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
