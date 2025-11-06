import { createResult, getResultsByUser, getResultById, updateResult, deleteResult } from "../models/resultModel.js";

export const addResult = async (userId, data) => {
  // Get enrollment_id if exists
  const enrollmentId = data.enrollmentId || null;
  return await createResult({
    userId,
    programId: data.programId,
    enrollmentId,
    workoutDate: data.workoutDate || new Date().toISOString().split('T')[0],
    notes: data.notes,
    completed: data.completed
  });
};

export const fetchResults = async (userId, programId = null) => {
  return await getResultsByUser(userId, programId);
};

export const fetchResultById = async (id, userId) => {
  return await getResultById(id, userId);
};

export const modifyResult = async (id, userId, data) => {
  return await updateResult(id, userId, data);
};

export const removeResult = async (id, userId) => {
  return await deleteResult(id, userId);
};

