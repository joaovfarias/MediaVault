import { Request, Response } from "express";
import { AppError } from "../services/appError";
import {
  createFolder,
  deleteFolder,
  getUserFoldersFromRoot,
  renameFolder,
  getFolderById,
  starFolderForUser,
  getStarredFoldersForUser,
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
    const parentIdRaw = req.query.parentId;
    const parentId =
      typeof parentIdRaw === "string" && parentIdRaw.trim().length > 0
        ? parentIdRaw
        : undefined;

    const folders = await getUserFoldersFromRoot(userId, parentId);
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
    const deletedFolder = await deleteFolder(folderId, ownerId);

    res.status(200).json(deletedFolder);
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

export const starFolder = async (req: Request, res: Response) => {
  try {
    const folderId = req.params.id;
    const ownerId = req.user!._id.toString();
    const folder = await getFolderById(folderId, ownerId);

    if (!folder) {
      return res.status(404).json({ error: "Pasta não encontrada" });
    }

    const updatedFolder = await starFolderForUser(folderId, ownerId);
    res.status(200).json(updatedFolder);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};

export const getStarredFolders = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user!._id.toString();
    const folders = await getStarredFoldersForUser(ownerId);
    res.status(200).json(folders);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
