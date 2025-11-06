import { enrollInProgram, unenrollFromProgram, updateEnrollmentProgress, getEnrollmentsByUser } from "../models/enrollmentModel.js";

export const addEnrollment = async (userId, programId) => {
  return await enrollInProgram(userId, programId);
};

export const removeEnrollment = async (userId, programId) => {
  return await unenrollFromProgram(userId, programId);
};

export const updateProgress = async (userId, programId, progress) => {
  return await updateEnrollmentProgress(userId, programId, progress);
};

export const fetchMyPrograms = async (userId) => {
  return await getEnrollmentsByUser(userId);
};


