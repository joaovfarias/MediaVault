import { Request, Response } from "express";
import { getAllUsersWithStorage } from "../services/admin.service";

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersWithStorage();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin dashboard data" });
  }
};
