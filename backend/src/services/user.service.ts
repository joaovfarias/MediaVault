import File from "../models/File";
import User from "../models/User";
import { AppError } from "./appError";
import { deleteAllFilesForUser } from "./file.service";
import { deleteAllFoldersForUser } from "../controllers/folder.controller";

export const getUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return user;
};

export const deleteUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  await deleteAllFilesForUser(userId);
  await deleteAllFoldersForUser(userId);
  await user.deleteOne();
};
