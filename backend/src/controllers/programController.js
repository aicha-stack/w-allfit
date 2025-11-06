import { addProgram, fetchPrograms, fetchProgramById, modifyProgram, removeProgram } from "../services/programService.js";

export const createProgramController = async (req, res) => {
  try {
    const program = await addProgram(req.body);
    res.status(201).json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getProgramsController = async (req, res) => {
  try {
    const programs = await fetchPrograms();
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProgramByIdController = async (req, res) => {
  try {
    const program = await fetchProgramById(req.params.id);
    if (!program) return res.status(404).json({ message: "Programme non trouvé" });
    res.json(program);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProgramController = async (req, res) => {
  try {
    const program = await modifyProgram(req.params.id, req.body);
    res.json(program);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProgramController = async (req, res) => {
  try {
    const result = await removeProgram(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
