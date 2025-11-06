import { 
  getWeekSchedule, 
  scheduleWorkout, 
  markWorkoutComplete, 
  removeWorkoutSchedule,
  getTodaysWorkout 
} from "../services/plannerService.js";

export const getWeeklyScheduleController = async (req, res) => {
  try {
    const weekStart = req.query.weekStart || null;
    const schedule = await getWeekSchedule(req.user.id, weekStart);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkoutScheduleController = async (req, res) => {
  try {
    const schedule = await scheduleWorkout(req.user.id, req.body);
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const completeWorkoutController = async (req, res) => {
  try {
    const schedule = await markWorkoutComplete(req.params.id, req.user.id);
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteWorkoutScheduleController = async (req, res) => {
  try {
    const result = await removeWorkoutSchedule(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTodayWorkoutController = async (req, res) => {
  try {
    const workout = await getTodaysWorkout(req.user.id);
    res.json(workout || { message: "No workout scheduled for today" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resetWorkoutController = async (req, res) => {
  try {
    const schedule = await resetWorkoutSchedule(req.params.id, req.user.id);
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

