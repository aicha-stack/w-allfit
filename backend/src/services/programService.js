import { createProgram, getAllPrograms, getProgramById, updateProgram, deleteProgram } from "../models/programModel.js";

export const addProgram = async (data) => {
  return await createProgram(data);
};

export const fetchPrograms = async () => {
  return await getAllPrograms();
};

export const fetchProgramById = async (id) => {
  return await getProgramById(id);
};

export const modifyProgram = async (id, data) => {
  return await updateProgram(id, data);
};

export const removeProgram = async (id) => {
  return await deleteProgram(id);
};
