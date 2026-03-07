import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { Snackbar } from "@mui/material";
import { getAuthToken } from "../utils/auth";

type NewUploadBarProps = {
  isVisible: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const ALLOWED_MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "image/jpeg": "jpg",
  "image/png": "png",
  "video/mp4": "mp4",
};
const ALLOWED_EXTENSIONS = new Set(
  Object.values(ALLOWED_MIME_TO_EXTENSION).map((ext) => ext.toLowerCase()),
);
const ACCEPTED_FILE_TYPES = Object.keys(ALLOWED_MIME_TO_EXTENSION).join(",");

export default function NewUploadBar({ isVisible }: NewUploadBarProps) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const isAllowedFileType = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAllowedMime = file.type in ALLOWED_MIME_TO_EXTENSION;
    const hasAllowedExtension = ALLOWED_EXTENSIONS.has(extension);

    return hasAllowedMime || hasAllowedExtension;
  };

  const uploadSingleFile = async (file: File, token: string) => {
    const uploadUrlResponse = await fetch(
      `${API_BASE_URL}/api/files/upload-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      },
    );

    // UploadSingeFolder

    if (!uploadUrlResponse.ok) {
      const errorData = (await uploadUrlResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorData?.message ?? "Failed to generate upload URL");
    }

    const { uploadUrl, s3Key } = (await uploadUrlResponse.json()) as {
      uploadUrl: string;
      s3Key: string;
    };

    const uploadToS3Response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadToS3Response.ok) {
      throw new Error("Failed to upload file to storage");
    }

    const originalName = file.webkitRelativePath || file.name;

    const createRecordResponse = await fetch(`${API_BASE_URL}/api/files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        s3Key,
        originalName,
        mimeType: file.type,
      }),
    });

    if (!createRecordResponse.ok) {
      const errorData = (await createRecordResponse
        .json()
        .catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorData?.message ?? "Failed to save file record");
    }
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSnackbarMessage(
        "Você precisa estar autenticado para enviar arquivos.",
      );
      setShowSnackbar(true);
      event.target.value = "";
      return;
    }

    const files = Array.from(fileList);
    const invalidFiles = files.filter((file) => !isAllowedFileType(file));

    if (invalidFiles.length > 0) {
      const allowed = Array.from(ALLOWED_EXTENSIONS)
        .map((ext) => `.${ext}`)
        .join(", ");
      const invalidNames = invalidFiles.map((file) => file.name).join(", ");

      setSnackbarMessage(
        `Alguns arquivos não são permitidos: ${invalidNames}. Tipos aceitos: ${allowed}`,
      );
      setShowSnackbar(true);
      event.target.value = "";

      return;
    }

    try {
      await Promise.all(files.map((file) => uploadSingleFile(file, token)));
      window.dispatchEvent(new Event("files:updated"));
      setSnackbarMessage("Upload concluído com sucesso.");
      setShowSnackbar(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar arquivos.";
      setSnackbarMessage(message);
      setShowSnackbar(true);
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (!folderInputRef.current) {
      return;
    }

    folderInputRef.current.setAttribute("webkitdirectory", "");
    folderInputRef.current.setAttribute("directory", "");
  }, []);

  return (
    <>
      <div
        className={`w-44 bg-white border border-gray-200 rounded-xl p-2 shadow-sm origin-top transform-gpu transition-all duration-200 ease-out ${
          isVisible ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleInputChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES}
          multiple
          onChange={handleInputChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
        >
          <div className="flex items-center">
            <MdOutlineUploadFile className="mr-2 w-5 h-5 text-[#006D7A]" />
            <span className="text-xs">Upload de arquivo</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
        >
          <div className="flex items-center">
            <MdOutlineDriveFolderUpload className="mr-2 w-5 h-5 text-[#006D7A]" />
            <span className="text-xs">Criar nova pasta</span>
          </div>
        </button>
      </div>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
