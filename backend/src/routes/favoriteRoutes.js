import express from "express";
import {
  toggleFavoriteController,
  getFavoritesController,
  checkFavoriteStatusController,
  getFavoriteStatusesController
} from "../controllers/favoriteController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all favorites for the current user (must be before /:programId routes)
router.get("/", getFavoritesController);

// Get favorite statuses for multiple programs (must be before /:programId routes)
router.get("/statuses", getFavoriteStatusesController);

// Toggle favorite status (add if not favorited, remove if favorited)
router.post("/:programId/toggle", toggleFavoriteController);

// Check if a specific program is favorited
router.get("/:programId/status", checkFavoriteStatusController);

export default router;

