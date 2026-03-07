import File from "../models/File";
import User from "../models/User";
import { AppError } from "./appError";

export const getUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return user;
};
