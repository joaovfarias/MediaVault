import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    s3Key: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true, // in bytes
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    folder: {
      type: String,
      default: "root",
    },
  },
  { timestamps: true },
);

export default mongoose.model("File", fileSchema);
