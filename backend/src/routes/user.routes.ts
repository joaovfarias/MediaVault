import express from "express";
import { getUserProfile } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/profile", protect, getUserProfile);

export default router;
