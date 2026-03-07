import { BiSolidFilePdf } from "react-icons/bi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { getDownloadFilename } from "../utils/fileName";
import { BiSolidFileTxt } from "react-icons/bi";
import { BiSolidFileJpg } from "react-icons/bi";
import { BiSolidFilePng } from "react-icons/bi";
import { BsFiletypeMp4 } from "react-icons/bs";

import { HiOutlineTrash } from "react-icons/hi2";
import { Snackbar } from "@mui/material";

import FilePreview from "./FilePreview";
import RenameFile from "./RenameFile";

export default function FileComponent({
  file,
}: {
  file: { _id: string; originalName: string; mimeType: string };
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const animationDuration = 200;

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const getAuthToken = () => {
    const directToken = localStorage.getItem("token");
    if (directToken) {
      return directToken;
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const parsedUser = JSON.parse(userRaw) as { token?: string };
        if (parsedUser.token) {
          return parsedUser.token;
        }
      } catch {
        return null;
      }
    }
    return null;
  };
  const token = getAuthToken();

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsMenuVisible(true);
    requestAnimationFrame(() => setIsMenuOpen(true));
  };

  const closeMenu = () => {
    setIsMenuOpen(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsMenuVisible(false);
      closeTimeoutRef.current = null;
    }, animationDuration);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const handleDeleteFile = async (token: string | null, _id: string) => {
    if (!token) {
      setSnackbarMessage(
        "Token de autorização não disponível. Faça login novamente.",
      );
      setShowSnackbar(true);
      return;
    }

    const deleteFileResponse = await fetch(`${API_BASE_URL}/api/files/${_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (deleteFileResponse.ok) {
      setSnackbarMessage("Arquivo deletado com sucesso");
      setShowSnackbar(true);
      window.dispatchEvent(new CustomEvent("files:updated"));
    } else {
      const errorData = (await deleteFileResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      setSnackbarMessage(errorData?.message ?? "Failed to delete file");
      setShowSnackbar(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMenuVisible) {
        return;
      }

      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isMenuVisible]);

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

  const handleDownloadFile = async () => {
    const downloadResponse = await fetch(
      `${API_BASE_URL}/api/files/${file._id}/download?download=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (downloadResponse.ok) {
      const data = (await downloadResponse.json()) as { downloadUrl?: string };
      if (data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = file.originalName;
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setSnackbarMessage("Download URL not available");
        setShowSnackbar(true);
      }
    } else {
      setSnackbarMessage("Failed to get download URL");
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

      {isEditingName && (
        <RenameFile file={file} isEditingName={setIsEditingName} />
      )}
      <div
        ref={menuContainerRef}
        className="relative flex flex-col text-black bg-[#f0f4f9] p-4 rounded-xl w-60 h-16 hover:bg-[#e0e8f1] cursor-pointer"
        onClick={handlePreviewFile}
      >
        <div className="flex-1 flex items-center justify-start gap-2">
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
          <div
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu();
            }}
          >
            <BsThreeDotsVertical className="text-xl text-black" />
          </div>
        </div>

        {isMenuVisible && (
          <div
            className="absolute top-12 right-2 z-20"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`w-35 bg-white border border-gray-200 rounded-xl p-2 shadow-sm origin-top transform-gpu transition-all duration-200 ease-out ${
                isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
              }`}
            >
              <button
                type="button"
                className="flex flex-row gap-3 items-center w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDownloadFile();
                  setIsMenuVisible(false);
                }}
              >
                <MdOutlineFileDownload className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-5 h-5 shrink-0" />
                Baixar
              </button>
              <button
                type="button"
                className="flex flex-row gap-3 items-center w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsEditingName(true);
                  setIsMenuVisible(false);
                }}
              >
                <MdOutlineDriveFileRenameOutline className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-5 h-5 shrink-0" />
                Renomear
              </button>
              <button
                type="button"
                className="flex flex-row gap-3 items-center w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteFile(token, file._id);
                  setIsMenuVisible(false);
                }}
              >
                <HiOutlineTrash className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-5 h-5 shrink-0" />
                Deletar
              </button>
            </div>
          </div>
        )}
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
