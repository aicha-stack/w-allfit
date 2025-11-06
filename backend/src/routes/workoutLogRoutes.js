import express from "express";
import {
  markDayWorked,
  unmarkDayWorked,
  getWorkoutLogs,
  getWorkoutLogByDate
} from "../controllers/workoutLogController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/mark", markDayWorked);
router.post("/unmark", unmarkDayWorked);
router.get("/", getWorkoutLogs);
router.get("/:date", getWorkoutLogByDate);

export default router;

