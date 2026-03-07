import { Request, Response } from "express";
import {
  createFileRecordForUser,
  deleteFileForUser,
  generateUploadUrlForUser,
  getDownloadUrlForFile,
  getUserFilesList,
  renameFileForUser,
} from "../services/file.service";
import { AppError } from "../services/appError";

const getUserIdFromRequest = (req: Request) => req.user!._id.toString();

export const renameFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const { newName } = req.body;
    const userId = getUserIdFromRequest(req);
    await renameFileForUser({ fileId, newName, userId });

    res.status(200).json({ message: "Arquivo renomeado com sucesso" });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao renomear arquivo" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const userId = getUserIdFromRequest(req);

    await deleteFileForUser({ fileId, userId });

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao deletar arquivo" });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const userId = getUserIdFromRequest(req);
    const asAttachment = req.query.download === "true";

    const { downloadUrl } = await getDownloadUrlForFile({
      fileId,
      userId,
      asAttachment,
    });

    res.status(200).json({ downloadUrl });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao gerar URL de download" });
  }
};

// TODO - add filtering by type, sort by date.
export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const sortBySize = req.query.sortBySize === "true";

    const files = await getUserFilesList(userId, sortBySize);

    res.status(200).json(files);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao buscar arquivos do usuário" });
  }
};

export const createFileRecord = async (req: Request, res: Response) => {
  try {
    const { s3Key, originalName, mimeType } = req.body;
    const userId = getUserIdFromRequest(req);

    const file = await createFileRecordForUser({
      s3Key,
      originalName,
      mimeType,
      userId,
    });

    res.status(201).json(file);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Erro ao salvar registro do arquivo" });
  }
};

export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const { filename, mimeType, size } = req.body;
    const userId = getUserIdFromRequest(req);

    const uploadPayload = await generateUploadUrlForUser({
      filename,
      mimeType,
      size,
      userId,
    });

    res.status(200).json(uploadPayload);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro ao gerar URL de upload",
    });
  }
};
