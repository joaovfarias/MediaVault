import { Request, Response } from "express";
import { s3 } from "../config/s3";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import File from "../models/File";
import User from "../models/User";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

const mimeTypeToExtension: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "image/jpeg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 200;
const MAX_TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB

const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "video/mp4",
];

const getDownloadFilename = (originalName: string, mimeType: string) => {
  const hasExtension = /\.[^./\\]+$/.test(originalName);

  if (hasExtension) {
    return originalName;
  }

  const extension = mimeTypeToExtension[mimeType];
  return extension ? `${originalName}.${extension}` : originalName;
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const userId = req.user!._id;

    const file = await File.findOne({ _id: fileId, owner: userId });

    if (!file) {
      return res.status(404).json({ message: "Arquivo não encontrado" });
    }

    if (file.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    // Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: "media-vault-83729",
        Key: file.s3Key,
      }),
    );

    await User.findByIdAndUpdate(userId, { $inc: { storageUsed: -file.size } });

    await file.deleteOne();

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar arquivo" });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const userId = req.user!._id;

    const file = await File.findOne({ _id: fileId, owner: userId });

    if (!file) {
      return res.status(404).json({ message: "Arquivo não encontrado" });
    }

    if (file.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    const downloadFilename = getDownloadFilename(
      file.originalName,
      file.mimeType,
    );

    const command = new GetObjectCommand({
      Bucket: "media-vault-83729",
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
    });

    const downloadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60, // 1 minute
    });

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao gerar URL de download" });
  }
};

// TODO - add filtering by type, sort by date.
export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;

    const files = await File.find({ owner: userId }).sort({ createdAt: -1 });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar arquivos do usuário" });
  }
};

export const createFileRecord = async (req: Request, res: Response) => {
  try {
    const { s3Key, originalName, mimeType } = req.body;
    const userId = req.user!._id;

    if (!s3Key || !originalName || !mimeType) {
      return res.status(400).json({ message: "Dados do arquivo ausentes" });
    }

    if (!s3Key.startsWith(`${userId}/`)) {
      return res.status(400).json({ message: "Chave de arquivo inválida" });
    }

    // Verify file exists in S3
    const headCommand = new HeadObjectCommand({
      Bucket: "media-vault-83729",
      Key: s3Key,
    });

    const s3Response = await s3.send(headCommand);

    const fileSize = s3Response.ContentLength || 0;

    // Enforce file count limit
    const fileCount = await File.countDocuments({ owner: userId });
    if (fileCount >= MAX_FILES) {
      return res.status(400).json({ message: "Limite de arquivos atingido" });
    }

    // Enforce total storage limit
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (user.storageUsed + fileSize > MAX_TOTAL_STORAGE) {
      return res
        .status(400)
        .json({ message: "Limite de armazenamento excedido" });
    }

    // Save file metadata
    const file = await File.create({
      owner: userId,
      originalName,
      s3Key,
      mimeType,
      size: fileSize,
    });

    // Update user storage
    user.storageUsed += fileSize;
    await user.save();

    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar registro do arquivo" });
  }
};

export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const { filename, mimeType, size } = req.body;

    if (!filename || !mimeType || !size) {
      return res.status(400).json({ message: "Dados do arquivo ausentes" });
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ message: "Tipo de arquivo não permitido" });
    }

    if (size > MAX_FILE_SIZE) {
      return res
        .status(400)
        .json({ message: "Tamanho máximo do arquivo excedido (50MB)" });
    }

    const userId = req.user!._id.toString();

    const { v4: uuidv4 } = await import("uuid");
    const uniqueKey = `${userId}/${uuidv4()}_${filename}`;

    const command = new PutObjectCommand({
      Bucket: "media-vault-83729",
      Key: uniqueKey,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 60, // 1 minute
    });

    // TODO FRONTEND - hit PUT in uploadURL, then POST /api/files with metadata to create record and update storage usage
    res.status(200).json({
      uploadUrl,
      s3Key: uniqueKey,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao gerar URL de upload",
      error,
    });
  }
};
