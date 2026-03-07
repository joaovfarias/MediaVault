import { Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth.service";
import { AppError } from "../services/appError";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const authPayload = await registerUser({ username, email, password });

    res.status(201).json(authPayload);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const authPayload = await loginUser({ email, password });

    res.json(authPayload);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};
