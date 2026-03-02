import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateUploadUrl } from "../controllers/file.controller";
import { createFileRecord } from "../controllers/file.controller";

const router = express.Router();

router.post("/upload-url", protect, generateUploadUrl);
router.post("/", protect, createFileRecord);

export default router;
