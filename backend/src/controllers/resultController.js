import { addResult, fetchResults, fetchResultById, modifyResult, removeResult } from "../services/resultService.js";

export const createResultController = async (req, res) => {
  try {
    const result = await addResult(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getResultsController = async (req, res) => {
  try {
    const programId = req.query.programId ? parseInt(req.query.programId, 10) : null;
    const results = await fetchResults(req.user.id, programId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getResultByIdController = async (req, res) => {
  try {
    const result = await fetchResultById(req.params.id, req.user.id);
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateResultController = async (req, res) => {
  try {
    const result = await modifyResult(req.params.id, req.user.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteResultController = async (req, res) => {
  try {
    const result = await removeResult(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

