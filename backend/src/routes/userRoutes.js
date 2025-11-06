import express from "express";
import { register, login, getProfile, updateProfile, getUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateRegister, validateLogin, validateUpdateProfile } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validateUpdateProfile, updateProfile);
router.get("/", getUsers);

export default router;

