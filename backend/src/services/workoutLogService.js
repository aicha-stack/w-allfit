import * as workoutLogModel from "../models/workoutLogModel.js";

export const markDayWorked = async (userId, workoutDate) => {
  return await workoutLogModel.markDayWorked(userId, workoutDate);
};

export const unmarkDayWorked = async (userId, workoutDate) => {
  return await workoutLogModel.unmarkDayWorked(userId, workoutDate);
};

export const getWorkoutLogs = async (userId, startDate, endDate) => {
  return await workoutLogModel.getWorkoutLogs(userId, startDate, endDate);
};

export const getWorkoutLogByDate = async (userId, workoutDate) => {
  return await workoutLogModel.getWorkoutLogByDate(userId, workoutDate);
};

