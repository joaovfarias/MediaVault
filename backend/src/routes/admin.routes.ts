import express from "express";
import { getAdminDashboard } from "../controllers/admin.controller";
import { protect } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/admin.middleware";

const router = express.Router();

router.get("/dashboard", protect, requireAdmin, getAdminDashboard);

export default router;
