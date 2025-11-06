import { 
  getOrCreateNutritionLog, 
  updateNutritionLog, 
  getNutritionLogs, 
  getNutritionGoals, 
  updateNutritionGoals 
} from "../models/nutritionModel.js";

export const getTodayNutrition = async (userId) => {
  return await getOrCreateNutritionLog(userId);
};

export const updateTodayNutrition = async (userId, data) => {
  return await updateNutritionLog(userId, null, data);
};

export const getNutritionHistory = async (userId, days = 7) => {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  return await getNutritionLogs(userId, startDateStr, endDate);
};

export const getUserGoals = async (userId) => {
  return await getNutritionGoals(userId);
};

export const updateUserGoals = async (userId, data) => {
  return await updateNutritionGoals(userId, data);
};

