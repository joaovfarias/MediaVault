import express from "express";
import {
  getUserProfile,
  deleteUserProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.delete("/:id/delete", protect, requireAdmin, deleteUserProfile);

export default router;
