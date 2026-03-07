import { Request, Response } from "express";
import { AppError } from "../services/appError";
import { getUser } from "../services/user.service";

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const user = await getUser(userId);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao obter perfil do usuário" });
  }
};
