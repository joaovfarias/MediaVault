import { BiSolidFileTxt } from "react-icons/bi";
import { BiSolidFileJpg } from "react-icons/bi";
import { BiSolidFilePng } from "react-icons/bi";
import { BsFiletypeMp4 } from "react-icons/bs";
import { BiSolidFilePdf } from "react-icons/bi";
import { useState } from "react";
import FilePreview from "./FilePreview";
import { Snackbar } from "@mui/material";

interface File {
  _id: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export default function StorageComponent({ file }: { file: File }) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleClickStorageFile = async (fileId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/files/${fileId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (response.ok) {
        const data = (await response.json()) as { downloadUrl?: string };
        setPreviewUrl(data.downloadUrl ?? undefined);
        setIsPreviewing(true);
      } else {
        setSnackbarMessage("Failed to get preview URL");
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <>
      <hr className="border-gray-300 mt-2" />
      <div
        className="mt-2 ml-5 mr-5 flex items-center justify-between gap-4 hover:bg-gray-100 rounded-lg p-2 cursor-pointer"
        onClick={() => {
          setIsPreviewing(true);
          handleClickStorageFile(file._id);
        }}
      >
        <div className="flex min-w-0 items-center gap-4">
          <span className="shrink-0 text-sm text-gray-700">
            {file.mimeType === "text/plain" && (
              <BiSolidFileTxt className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "image/jpeg" && (
              <BiSolidFileJpg className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "image/png" && (
              <BiSolidFilePng className="text-lg text-[#4285f4]" />
            )}
            {file.mimeType === "video/mp4" && (
              <BsFiletypeMp4 className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "application/pdf" && (
              <BiSolidFilePdf className="text-base text-[#4285f4]" />
            )}
          </span>
          <span className="truncate text-sm text-gray-700">
            {file.originalName}
          </span>
        </div>
        <span className="shrink-0 text-sm text-gray-700">
          {(file.size / (1024 * 1024)).toFixed(1)} MB
        </span>
      </div>
      {isPreviewing && (
        <FilePreview
          file={file}
          url={previewUrl}
          setIsPreviewing={setIsPreviewing}
        />
      )}

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
