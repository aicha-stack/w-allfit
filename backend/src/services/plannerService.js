import { 
  getWeeklySchedule, 
  upsertWorkoutSchedule, 
  completeWorkout, 
  deleteWorkoutSchedule,
  getTodayWorkout,
  resetWorkout 
} from "../models/plannerModel.js";

export const getWeekSchedule = async (userId, weekStart = null) => {
  if (!weekStart) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Get Monday
    const monday = new Date(today.setDate(diff));
    weekStart = monday.toISOString().split('T')[0];
  }
  
  return await getWeeklySchedule(userId, weekStart);
};

export const scheduleWorkout = async (userId, data) => {
  return await upsertWorkoutSchedule(userId, data);
};

export const markWorkoutComplete = async (scheduleId, userId) => {
  return await completeWorkout(scheduleId, userId);
};

export const removeWorkoutSchedule = async (scheduleId, userId) => {
  return await deleteWorkoutSchedule(scheduleId, userId);
};

export const getTodaysWorkout = async (userId) => {
  return await getTodayWorkout(userId);
};

export const resetWorkoutSchedule = async (scheduleId, userId) => {
  return await resetWorkout(scheduleId, userId);
};

