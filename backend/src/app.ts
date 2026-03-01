import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { protect } from "./middleware/auth.middleware";
import User from "./models/User";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI as string;

app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
  });

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to the MediaVault API!" });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({ message: "This is a protected route" });
});
