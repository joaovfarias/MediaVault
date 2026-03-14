import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import fileRoutes from "./routes/file.routes";
import userRoutes from "./routes/user.routes";
import folderRoutes from "./routes/folder.routes";
import adminRoutes from "./routes/admin.routes";

const env = process.env.NODE_ENV || "development";
const envFile = env === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: path.resolve(__dirname, "../", envFile) });

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI as string;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

const allowedOrigins = CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/admin", adminRoutes);

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

app.get("/ci-test", (req, res) => {
  res.json({ message: "CI/CD pipeline works 🚀" });
});
