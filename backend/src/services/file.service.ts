import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import File from "../models/File";
import User from "../models/User";
import { AppError } from "./appError";

const BUCKET_NAME = "media-vault-83729";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 200;
const MAX_TOTAL_STORAGE = 5 * 1024 * 1024 * 1024; // 5 GB

const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
  "video/mp4",
];

interface GenerateUploadUrlInput {
  filename: string;
  mimeType: string;
  size: number;
  userId: string;
}

interface CreateFileRecordInput {
  s3Key: string;
  originalName: string;
  mimeType: string;
  userId: string;
}

interface DownloadFileInput {
  fileId: string;
  userId: string;
  asAttachment?: boolean;
}

interface DeleteFileInput {
  fileId: string;
  userId: string;
}

const getUserStorageSnapshotFromS3 = async (userId: string) => {
  let continuationToken: string | undefined;
  let totalSize = 0;
  let totalFiles = 0;

  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: `${userId}/`,
        ContinuationToken: continuationToken,
      }),
    );

    const objects = page.Contents ?? [];
    for (const object of objects) {
      totalFiles += 1;
      totalSize += object.Size ?? 0;
    }

    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  return { totalSize, totalFiles };
};

export const renameFileForUser = async ({
  fileId,
  newName,
  userId,
}: {
  fileId: string;
  newName: string;
  userId: string;
}) => {
  if (!newName) {
    throw new AppError("Novo nome do arquivo é obrigatório", 400);
  }
  const file = await assertOwnedFile({ fileId, userId });
  file.originalName = newName;
  await file.save();
};

const assertOwnedFile = async ({ fileId, userId }: DownloadFileInput) => {
  const file = await File.findOne({ _id: fileId, owner: userId });

  if (!file) {
    throw new AppError("Arquivo não encontrado", 404);
  }

  if (file.owner.toString() !== userId.toString()) {
    throw new AppError("Acesso negado", 403);
  }

  return file;
};

export const generateUploadUrlForUser = async ({
  filename,
  mimeType,
  size,
  userId,
}: GenerateUploadUrlInput) => {
  if (!filename || !mimeType || size === undefined || size === null) {
    throw new AppError("Dados do arquivo ausentes", 400);
  }

  const parsedSize = Number(size);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    throw new AppError("Tamanho de arquivo inválido", 400);
  }

  if (!allowedMimeTypes.includes(mimeType)) {
    throw new AppError("Tipo de arquivo não permitido", 400);
  }

  if (parsedSize > MAX_FILE_SIZE) {
    throw new AppError("Tamanho máximo do arquivo excedido (100MB)", 400);
  }

  const user = await User.findById(userId).select("storageUsed");
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  const { totalSize: s3StorageUsed, totalFiles: s3FileCount } =
    await getUserStorageSnapshotFromS3(userId);

  if (s3FileCount >= MAX_FILES) {
    throw new AppError("Limite de arquivos atingido", 400);
  }

  if (
    Math.max(user.storageUsed, s3StorageUsed) + parsedSize >
    MAX_TOTAL_STORAGE
  ) {
    throw new AppError("Limite de armazenamento excedido", 400);
  }

  const { v4: uuidv4 } = await import("uuid");
  const uniqueKey = `${userId}/${uuidv4()}_${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: uniqueKey,
    ContentType: mimeType,
    ContentLength: parsedSize,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return {
    uploadUrl,
    s3Key: uniqueKey,
  };
};

export const createFileRecordForUser = async ({
  s3Key,
  originalName,
  mimeType,
  userId,
}: CreateFileRecordInput) => {
  if (!s3Key || !originalName || !mimeType) {
    throw new AppError("Dados do arquivo ausentes", 400);
  }

  if (!s3Key.startsWith(`${userId}/`)) {
    throw new AppError("Chave de arquivo inválida", 400);
  }

  const headCommand = new HeadObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const s3Response = await s3.send(headCommand);
  const fileSize = s3Response.ContentLength || 0;

  if (fileSize <= 0) {
    throw new AppError("Arquivo inválido ou vazio", 400);
  }

  if (fileSize > MAX_FILE_SIZE) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      }),
    );
    throw new AppError("Tamanho máximo do arquivo excedido (20MB)", 400);
  }

  const fileCount = await File.countDocuments({ owner: userId });
  if (fileCount >= MAX_FILES) {
    throw new AppError("Limite de arquivos atingido", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  if (user.storageUsed + fileSize > MAX_TOTAL_STORAGE) {
    throw new AppError("Limite de armazenamento excedido", 400);
  }

  const file = await File.create({
    owner: userId,
    originalName,
    s3Key,
    mimeType,
    size: fileSize,
  });

  user.storageUsed += fileSize;
  await user.save();

  return file;
};

export const getUserFilesList = async (userId: string, sortBySize: boolean) => {
  if (sortBySize) {
    return File.find({ owner: userId }).sort({ size: -1 });
  }
  return File.find({ owner: userId }).sort({ createdAt: -1 });
};

export const getDownloadUrlForFile = async ({
  fileId,
  userId,
  asAttachment = false,
}: DownloadFileInput) => {
  const file = await assertOwnedFile({ fileId, userId });

  const safeFilename = file.originalName.replace(/"/g, "");
  const hasExtension = /\.[^./\\]+$/.test(safeFilename);
  const filenameWithExtension = hasExtension
    ? safeFilename
    : `${safeFilename}.${file.mimeType.split("/")[1]}`;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: file.s3Key,
    ResponseContentDisposition: asAttachment
      ? `attachment; filename="${filenameWithExtension}"`
      : undefined,
  });

  const downloadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60,
  });

  return { downloadUrl };
};

export const deleteFileForUser = async ({
  fileId,
  userId,
}: DeleteFileInput) => {
  const file = await assertOwnedFile({ fileId, userId });

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.s3Key,
    }),
  );

  await User.findByIdAndUpdate(userId, { $inc: { storageUsed: -file.size } });
  await file.deleteOne();
};
