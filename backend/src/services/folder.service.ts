import Folder from "../models/Folder";
import Files from "../models/File";
import { AppError } from "./appError";
import { deleteFileForUser, enrichFilesWithThumbnails } from "./file.service";

export const createFolder = async (
  userId: string,
  name: string,
  parentId?: string,
) => {
  if (!name) {
    throw new AppError("O nome da pasta é obrigatório", 400);
  }
  const folder = new Folder({
    owner: userId,
    name,
    parentFolderId: parentId,
  });
  await folder.save();
  return folder;
};

export const getUserFoldersFromRoot = async (
  userId: string,
  parentId?: string,
) => {
  const folders = await Folder.find({
    owner: userId,
    parentFolderId: parentId ?? null,
  });
  return folders;
};

export const renameFolder = async ({
  folderId,
  newName,
  ownerId,
}: {
  folderId: string;
  newName: string;
  ownerId: string;
}) => {
  if (!newName) {
    throw new AppError("O novo nome da pasta é obrigatório", 400);
  }

  const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
  if (!folder) {
    throw new AppError("Pasta não encontrada ou acesso negado", 404);
  }

  const updatedFolder = await Folder.findByIdAndUpdate(
    folderId,
    { name: newName },
    { new: true },
  );

  if (!updatedFolder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  return updatedFolder;
};

export const deleteFolder = async (folderId: string, ownerId: string) => {
  const rootFolder = await Folder.findOne({ _id: folderId, owner: ownerId });
  if (!rootFolder) {
    throw new AppError("Pasta não encontrada", 404);
  }

  const folderIdsToDelete = [rootFolder._id.toString()];

  for (let index = 0; index < folderIdsToDelete.length; index += 1) {
    const currentFolderId = folderIdsToDelete[index];
    const children = await Folder.find({
      owner: ownerId,
      parentFolderId: currentFolderId,
    }).select("_id");

    for (const child of children) {
      folderIdsToDelete.push(child._id.toString());
    }
  }

  const files = await Files.find({
    owner: ownerId,
    folderId: { $in: folderIdsToDelete },
  });

  for (const file of files) {
    await deleteFileForUser({
      fileId: file._id.toString(),
      userId: file.owner.toString(),
    });
  }

  await Folder.deleteMany({
    owner: ownerId,
    _id: { $in: folderIdsToDelete },
  });

  return rootFolder;
};

export const getFolderById = async (folderId: string, ownerId: string) => {
  const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }
  const rawFiles = await Files.find({ folderId, owner: ownerId });
  const files = await enrichFilesWithThumbnails(rawFiles);
  return { folder, files };
};

export const starFolderForUser = async (folderId: string, ownerId: string) => {
  const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }
  folder.isStarred = !folder.isStarred;
  await folder.save();
  return folder;
};

export const getStarredFoldersForUser = async (ownerId: string) => {
  const folders = await Folder.find({ owner: ownerId, isStarred: true });
  return folders;
};
