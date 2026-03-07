import express from "express";
import {
  createNewFolder,
  getFoldersForUser,
  renameExistingFolder,
  deleteExistingFolder,
  getFolderDetails,
} from "../controllers/folder.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, createNewFolder);
router.get("/", protect, getFoldersForUser);
router.put("/:id", protect, renameExistingFolder);
router.delete("/:id", protect, deleteExistingFolder);
router.get("/:id", protect, getFolderDetails);

export default router;
