import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    parentFolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    isStarred: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Folder", folderSchema);
