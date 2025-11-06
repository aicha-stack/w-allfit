import express from "express";
import { 
  getNutritionController, 
  updateNutritionController, 
  getNutritionHistoryController,
  getGoalsController,
  updateGoalsController 
} from "../controllers/nutritionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/today", getNutritionController);
router.put("/today", updateNutritionController);
router.get("/history", getNutritionHistoryController);
router.get("/goals", getGoalsController);
router.put("/goals", updateGoalsController);

export default router;

