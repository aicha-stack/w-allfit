import { addEnrollment, removeEnrollment, updateProgress, fetchMyPrograms } from "../services/enrollmentService.js";

export const enroll = async (req, res) => {
  try {
    const programId = parseInt(req.params.id, 10);
    const data = await addEnrollment(req.user.id, programId);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unenroll = async (req, res) => {
  try {
    const programId = parseInt(req.params.id, 10);
    const data = await removeEnrollment(req.user.id, programId);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEnrollmentProgress = async (req, res) => {
  try {
    const programId = parseInt(req.params.id, 10);
    const { progress } = req.body;
    if (typeof progress !== 'number') {
      return res.status(400).json({ error: "Progress must be a number" });
    }
    const data = await updateProgress(req.user.id, programId, progress);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const myPrograms = async (req, res) => {
  try {
    const programs = await fetchMyPrograms(req.user.id);
    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


