import * as workoutLogService from "../services/workoutLogService.js";

export const markDayWorked = async (req, res) => {
  try {
    const { date } = req.body;
    const workoutDate = date || new Date().toISOString().split('T')[0];
    const log = await workoutLogService.markDayWorked(req.user.id, workoutDate);
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unmarkDayWorked = async (req, res) => {
  try {
    const { date } = req.body;
    const workoutDate = date || new Date().toISOString().split('T')[0];
    const log = await workoutLogService.unmarkDayWorked(req.user.id, workoutDate);
    res.json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getWorkoutLogs = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const startDate = start_date || new Date().toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];
    const logs = await workoutLogService.getWorkoutLogs(req.user.id, startDate, endDate);
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getWorkoutLogByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const log = await workoutLogService.getWorkoutLogByDate(req.user.id, date);
    res.json(log || { completed: false });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

