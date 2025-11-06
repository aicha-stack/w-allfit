import { 
  getTodayNutrition, 
  updateTodayNutrition, 
  getNutritionHistory, 
  getUserGoals, 
  updateUserGoals 
} from "../services/nutritionService.js";

export const getNutritionController = async (req, res) => {
  try {
    const nutrition = await getTodayNutrition(req.user.id);
    res.json(nutrition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNutritionController = async (req, res) => {
  try {
    const nutrition = await updateTodayNutrition(req.user.id, req.body);
    res.json(nutrition);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getNutritionHistoryController = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const history = await getNutritionHistory(req.user.id, days);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGoalsController = async (req, res) => {
  try {
    const goals = await getUserGoals(req.user.id);
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGoalsController = async (req, res) => {
  try {
    const goals = await updateUserGoals(req.user.id, req.body);
    res.json(goals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

