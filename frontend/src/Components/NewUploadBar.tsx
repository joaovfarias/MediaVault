import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { MdOutlineUploadFile } from "react-icons/md";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import FeedbackComponent from "./FeedbackComponent";
import { getAuthToken } from "../utils/auth";
import ChooseFolderNameDialog from "./ChooseFolderNameDialog";
import { useParams } from "react-router-dom";
import { useFileSystem } from "../contexts/FileSystemContext";

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

type UploadedFileRecord = {
  _id: string;
  originalName: string;
  mimeType: string;
  isStarred: boolean;
  thumbnailUrl: string | null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function NewUploadBar({ isVisible }: NewUploadBarProps) {
  const { folderId } = useParams<{ folderId: string }>();
  const { notifyFilesAdded } = useFileSystem();
  const [isUploading, setIsUploading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("error");
  const [showChooseFolderName, setShowChooseFolderName] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAllowedFileType = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAllowedMime = file.type in ALLOWED_MIME_TO_EXTENSION;
    const hasAllowedExtension = ALLOWED_EXTENSIONS.has(extension);

    return hasAllowedMime || hasAllowedExtension;
  };

  const waitForThumbnailsReady = async (
    token: string,
    uploadedIds: string[],
  ): Promise<UploadedFileRecord[]> => {
    const maxAttempts = 10;
    const delayMs = 1000;
    const folderQuery = `?folderId=${encodeURIComponent(folderId ?? "null")}`;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await fetch(`${API_BASE_URL}/api/files${folderQuery}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      if (response?.ok) {
        const data = (await response.json()) as UploadedFileRecord[];
        const uploadedRecords = data.filter((fileRecord) =>
          uploadedIds.includes(fileRecord._id),
        );
        const allReady = uploadedIds.every((uploadedId) =>
          uploadedRecords.some(
            (fileRecord) =>
              fileRecord._id === uploadedId && Boolean(fileRecord.thumbnailUrl),
          ),
        );

        if (allReady) {
          return uploadedRecords;
        }
      }

      await sleep(delayMs);
    }

    return [];
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
        folderId: folderId ?? null,
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

    const createdRecord = (await createRecordResponse
      .json()
      .catch(() => null)) as UploadedFileRecord | null;

    if (!createdRecord?._id) {
      throw new Error("Upload finished but file record id was not returned");
    }

    return createdRecord._id;
  };

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSnackbarSeverity("error");
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

      setSnackbarSeverity("warning");
      setSnackbarMessage(
        `Alguns arquivos não são permitidos: ${invalidNames}. Tipos aceitos: ${allowed}`,
      );
      setShowSnackbar(true);
      event.target.value = "";

      return;
    }

    try {
      setIsUploading(true);
      const uploadedIds = await Promise.all(
        files.map((file) => uploadSingleFile(file, token)),
      );
      const uploadedFiles = await waitForThumbnailsReady(token, uploadedIds);
      notifyFilesAdded(uploadedFiles);
      setSnackbarSeverity("success");
      setSnackbarMessage("Upload concluído com sucesso.");
      setShowSnackbar(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao enviar arquivos.";
      setSnackbarSeverity("error");
      setSnackbarMessage(message);
      setShowSnackbar(true);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

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
          onClick={() => setShowChooseFolderName(true)}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
        >
          <div className="flex items-center">
            <MdOutlineDriveFolderUpload className="mr-2 w-5 h-5 text-[#006D7A]" />
            <span className="text-xs">Criar nova pasta</span>
          </div>
        </button>
      </div>

      {showChooseFolderName && (
        <ChooseFolderNameDialog
          open={showChooseFolderName}
          parentId={folderId ?? null}
          onClose={() => setShowChooseFolderName(false)}
        />
      )}

      <FeedbackComponent
        message="Fazendo upload, por favor aguarde..."
        severity="info"
        open={isUploading}
        handleClose={() => {}}
      />

      <FeedbackComponent
        message={snackbarMessage}
        severity={snackbarSeverity}
        open={showSnackbar}
        handleClose={() => setShowSnackbar(false)}
      />
    </>
  );
}
