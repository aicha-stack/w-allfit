import express from "express";
import { createResultController, getResultsController, getResultByIdController, updateResultController, deleteResultController } from "../controllers/resultController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createResultController);
router.get("/", getResultsController);
router.get("/:id", getResultByIdController);
router.put("/:id", updateResultController);
router.delete("/:id", deleteResultController);

export default router;

