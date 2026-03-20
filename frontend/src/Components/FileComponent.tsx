import { BiSolidFilePdf } from "react-icons/bi";
import { useState } from "react";
import { getDownloadFilename } from "../utils/fileName";
import { BiSolidFileTxt } from "react-icons/bi";
import { BiSolidFileJpg } from "react-icons/bi";
import { BiSolidFilePng } from "react-icons/bi";
import { BsFiletypeMp4 } from "react-icons/bs";

import FeedbackComponent from "./FeedbackComponent";

import FilePreview from "./FilePreview";
import FileSettings from "./FileSettings";

export default function FileComponent({
  file,
  variant,
  onUnstar,
  onDelete,
  onRename,
}: {
  file: {
    _id: string;
    originalName: string;
    mimeType: string;
    isStarred: boolean;
    thumbnailUrl: string | null;
  };
  variant?: string;
  onUnstar?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  onRename?: (fileId: string, newName: string) => void;
}) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const getAuthToken = () => {
    const directToken = localStorage.getItem("token");
    if (directToken) {
      return directToken;
    }
    return null;
  };
  const token = getAuthToken();

  const handlePreviewFile = async () => {
    const previewUrl = await fetch(
      `${API_BASE_URL}/api/files/${file._id}/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (previewUrl.ok) {
      const data = (await previewUrl.json()) as { downloadUrl?: string };
      setDownloadUrl(data.downloadUrl ?? null);
      setIsPreviewing(true);
    } else {
      setSnackbarMessage("Failed to get preview URL");
      setShowSnackbar(true);
    }
  };

  return (
    <>
      {isPreviewing && downloadUrl && (
        <FilePreview
          file={file}
          url={downloadUrl}
          setIsPreviewing={setIsPreviewing}
        />
      )}

      <div className="relative w-fit">
        <div
          className="relative flex flex-col text-black bg-[#f0f4f9] p-4 rounded-xl w-55 hover:bg-[#e0e8f1] cursor-pointer"
          onClick={handlePreviewFile}
        >
          <div className="relative flex items-center justify-start gap-2 pr-12">
            {file.mimeType === "application/pdf" && (
              <BiSolidFilePdf className="text-3xl text-[#ea4335]" />
            )}
            {file.mimeType === "text/plain" && (
              <BiSolidFileTxt className="text-3xl text-[#4285f4]" />
            )}
            {file.mimeType === "image/jpeg" && (
              <BiSolidFileJpg className="text-3xl text-[#4285f4]" />
            )}
            {file.mimeType === "image/png" && (
              <BiSolidFilePng className="text-3xl text-[#4285f4]" />
            )}
            {file.mimeType === "video/mp4" && (
              <BsFiletypeMp4 className="text-2xl text-[#4285f4]" />
            )}

            <span className="text-base flex-1 text-center truncate">
              {getDownloadFilename(
                (file as { originalName: string }).originalName,
              )}
            </span>

            <FileSettings
              file={file}
              variant={variant}
              onUnstar={onUnstar}
              onDelete={onDelete}
              onRename={onRename}
            />
          </div>

          <div className="mt-4 w-full h-36 overflow-hidden rounded-lg bg-[#dfe6ee]">
            <img
              src={file.thumbnailUrl || undefined}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <FeedbackComponent
        message={snackbarMessage}
        severity="error"
        open={showSnackbar}
        handleClose={() => setShowSnackbar(false)}
      />
    </>
  );
}
