import express from "express";
import {
  createNewFolder,
  getFoldersForUser,
  renameExistingFolder,
  deleteExistingFolder,
  getFolderDetails,
  starFolder,
  getStarredFolders,
} from "../controllers/folder.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, createNewFolder);
router.get("/", protect, getFoldersForUser);
router.get("/starred", protect, getStarredFolders);
router.put("/:id", protect, renameExistingFolder);
router.delete("/:id", protect, deleteExistingFolder);
router.put("/:id/star", protect, starFolder);
router.get("/:id", protect, getFolderDetails);

export default router;
