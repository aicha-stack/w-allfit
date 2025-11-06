import express from "express";
import { createProgramController, getProgramsController, getProgramByIdController, updateProgramController, deleteProgramController } from "../controllers/programController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/roleMiddleware.js";
import { validateProgram, validateProgramId } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole('admin'), validateProgram, createProgramController);          // Créer un programme
router.get("/", getProgramsController);             // Récupérer tous les programmes
router.get("/:id", validateProgramId, getProgramByIdController);       // Récupérer un programme par ID
router.put("/:id", protect, requireRole('admin'), validateProgramId, validateProgram, updateProgramController);       // Modifier un programme
router.delete("/:id", protect, requireRole('admin'), validateProgramId, deleteProgramController);    // Supprimer un programme

export default router;
