import express from "express";
import { 
  getWeeklyScheduleController, 
  createWorkoutScheduleController,
  completeWorkoutController,
  deleteWorkoutScheduleController,
  getTodayWorkoutController,
  resetWorkoutController 
} from "../controllers/plannerController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/weekly", getWeeklyScheduleController);
router.get("/today", getTodayWorkoutController);
router.post("/", createWorkoutScheduleController);
router.put("/:id/complete", completeWorkoutController);
router.put("/:id/reset", resetWorkoutController);
router.delete("/:id", deleteWorkoutScheduleController);

export default router;

