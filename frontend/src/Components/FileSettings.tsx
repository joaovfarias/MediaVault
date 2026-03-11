import { useEffect, useRef, useState } from "react";
import { Snackbar } from "@mui/material";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { MdOutlineFileDownload } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getAuthToken } from "../utils/auth";
import RenameFile from "./RenameFile";
import { IoStarOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";

export default function FileSettings({
  file,
}: {
  file: {
    _id: string;
    originalName: string;
    mimeType: string;
    isStarred: boolean;
  };
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const animationDuration = 200;

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const token = getAuthToken();

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

  const handleStarFile = async (token: string | null, _id: string) => {
    if (!token) {
      setSnackbarMessage(
        "Token de autorização não disponível. Faça login novamente.",
      );
      setShowSnackbar(true);
      return;
    }

    const starFileResponse = await fetch(
      `${API_BASE_URL}/api/files/${_id}/star`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (starFileResponse.ok) {
      if (file.isStarred) {
        setSnackbarMessage("Arquivo desfavoritado com sucesso");
        window.dispatchEvent(new CustomEvent("files:updated"));
        setShowSnackbar(true);
      } else {
        setSnackbarMessage("Arquivo favoritado com sucesso");
        setShowSnackbar(true);
        window.dispatchEvent(new CustomEvent("files:updated"));
      }
    } else {
      const errorData = (await starFileResponse.json().catch(() => null)) as {
        message?: string;
      } | null;
      setSnackbarMessage(errorData?.message ?? "Failed to star file");
      setShowSnackbar(true);
    }
  };

  return (
    <>
      {isEditingName && (
        <RenameFile file={file} isEditingName={setIsEditingName} />
      )}
      <div
        ref={menuContainerRef}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20"
        onClick={(event) => event.stopPropagation()}
      >
        {isMenuVisible && (
          <div
            className={`absolute top-full right-0 mt-2 w-35 bg-white border border-gray-200 rounded-xl p-2 shadow-sm origin-top transform-gpu transition-all duration-200 ease-out ${
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
              <MdOutlineFileDownload className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
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
              <MdOutlineDriveFileRenameOutline className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              Renomear
            </button>
            <button
              type="button"
              className="flex flex-row gap-3 items-center w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                handleStarFile(token, file._id);
                setIsMenuVisible(false);
              }}
            >
              {file.isStarred ? (
                <IoStar className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              ) : (
                <IoStarOutline className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              )}
              {file.isStarred ? "Desfavoritar" : "Favoritar"}
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
              <HiOutlineTrash className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              Deletar
            </button>
          </div>
        )}
        <div
          className="p-2 rounded-full transition-all duration-200 ease-out hover:bg-gray-300 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
        >
          <BsThreeDotsVertical className="text-xl text-black" />
        </div>
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
