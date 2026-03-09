import express from "express";
import { protect } from "../middleware/auth.middleware";
import { generateUploadUrl } from "../controllers/file.controller";
import { createFileRecord } from "../controllers/file.controller";
import { getUserFiles } from "../controllers/file.controller";
import { downloadFile } from "../controllers/file.controller";
import { deleteFile } from "../controllers/file.controller";
import { renameFile } from "../controllers/file.controller";
import { starFile } from "../controllers/file.controller";
import { getUserStarredFiles } from "../controllers/file.controller";

const router = express.Router();

router.post("/upload-url", protect, generateUploadUrl);
router.post("/", protect, createFileRecord);
router.get("/", protect, getUserFiles);
router.get("/:id/download", protect, downloadFile);
router.delete("/:id", protect, deleteFile);
router.put("/:id/rename", protect, renameFile);
router.put("/:id/star", protect, starFile);
router.get("/starred", protect, getUserStarredFiles);

export default router;
