import { Request, Response } from "express";
import { s3 } from "../config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import File from "../models/File";
import User from "../models/User";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

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

export const createFileRecord = async (req: Request, res: Response) => {
  try {
    const { s3Key, originalName, mimeType } = req.body;
    const userId = req.user!._id;

    if (!s3Key || !originalName || !mimeType) {
      return res.status(400).json({ message: "Missing file data" });
    }

    // Ensure file belongs to user
    if (!s3Key.startsWith(`users/${userId}/`)) {
      return res.status(403).json({ message: "Invalid file key" });
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
      return res.status(400).json({ message: "File limit reached" });
    }

    // Enforce total storage limit
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.storageUsed + fileSize > MAX_TOTAL_STORAGE) {
      return res.status(400).json({ message: "Storage limit exceeded" });
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
    res.status(500).json({ message: "Error saving file record" });
  }
};

export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const { filename, mimeType, size } = req.body;

    if (!filename || !mimeType || !size) {
      return res.status(400).json({ message: "Missing file data" });
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ message: "File type not allowed" });
    }

    if (size > MAX_FILE_SIZE) {
      return res
        .status(400)
        .json({ message: "Maximum file size exceeded (50MB)" });
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
      message: "Error generating upload URL",
      error,
    });
  }
};
