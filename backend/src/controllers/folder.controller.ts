import { Request, Response } from "express";
import { AppError } from "../services/appError";
import {
  createFolder,
  deleteFolder,
  getUserFoldersFromRoot,
  renameFolder,
  getFolderById,
} from "../services/folder.service";

export const createNewFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { name, parentId } = req.body;
    const folder = await createFolder(userId, name, parentId);
    res.status(201).json(folder);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const getFoldersForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const folders = await getUserFoldersFromRoot(userId);
    res.status(200).json(folders);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const renameExistingFolder = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const { newName } = req.body;
    const ownerId = req.user!._id.toString();
    const folder = await renameFolder({ folderId, newName, ownerId });
    res.status(200).json(folder);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const deleteExistingFolder = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const ownerId = req.user!._id.toString();
    const folder = await deleteFolder(folderId, ownerId);
    res.status(200).json(folder);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const getFolderDetails = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const ownerId = req.user!._id.toString();
    const folder = await getFolderById(folderId, ownerId);
    res.status(200).json(folder);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
