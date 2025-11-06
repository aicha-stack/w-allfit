import express from "express";
import { enroll, unenroll, updateEnrollmentProgress, myPrograms } from "../controllers/enrollmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateProgramId, validateProgress } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/me", myPrograms);
router.post("/:id/enroll", validateProgramId, enroll);
router.put("/:id/progress", validateProgramId, validateProgress, updateEnrollmentProgress);
router.delete("/:id/enroll", validateProgramId, unenroll);

export default router;


