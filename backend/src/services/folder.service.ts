import Folder from "../models/Folder";
import Files from "../models/File";
import { AppError } from "./appError";
import { deleteFileForUser } from "./file.service";

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

export const getUserFoldersFromRoot = async (userId: string) => {
  const folders = await Folder.find({
    owner: userId,
    parentFolderId: null,
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
  const files = await Files.find({ parentFolderId: folderId });
  for (const file of files) {
    await deleteFileForUser({
      fileId: file._id.toString(),
      userId: file.owner.toString(),
    });
  }

  const folder = await Folder.findOneAndDelete({
    _id: folderId,
    owner: ownerId,
  });
  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }
  return folder;
};

export const getFolderById = async (folderId: string, ownerId: string) => {
  const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
  if (!folder) {
    throw new AppError("Pasta não encontrada", 404);
  }
  const files = await Files.find({ parentFolderId: folderId });
  return { folder, files };
};
