import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;


