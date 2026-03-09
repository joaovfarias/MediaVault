import { useEffect, useRef, useState } from "react";
import { Snackbar } from "@mui/material";
import { MdOutlineDriveFileRenameOutline } from "react-icons/md";
import { HiOutlineTrash } from "react-icons/hi2";
import { BsThreeDotsVertical } from "react-icons/bs";
import { getAuthToken } from "../utils/auth";
import RenameFolder from "./RenameFolder";
import { IoStar, IoStarOutline } from "react-icons/io5";

export default function FolderSettings({
  folder,
}: {
  folder: { _id?: string; name: string; isStarred: boolean };
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

  const handleDeleteFolder = async () => {
    if (!token) {
      setSnackbarMessage(
        "Token de autorização não disponível. Faça login novamente.",
      );
      setShowSnackbar(true);
      return;
    }

    if (!folder._id) {
      setSnackbarMessage("ID da pasta não disponível");
      setShowSnackbar(true);
      return;
    }

    const deleteResponse = await fetch(
      `${API_BASE_URL}/api/folders/${folder._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (deleteResponse.ok) {
      setSnackbarMessage("Pasta deletada com sucesso");
      setShowSnackbar(true);
      window.dispatchEvent(new CustomEvent("folders:updated"));
    } else {
      const errorData = (await deleteResponse.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      setSnackbarMessage(
        errorData?.error ?? errorData?.message ?? "Failed to delete folder",
      );
      setShowSnackbar(true);
    }
  };

  const handleStarFolder = async () => {
    if (!token) {
      setSnackbarMessage(
        "Token de autorização não disponível. Faça login novamente.",
      );
      setShowSnackbar(true);
      return;
    }

    if (!folder._id) {
      setSnackbarMessage("ID da pasta não disponível");
      setShowSnackbar(true);
      return;
    }

    const starResponse = await fetch(
      `${API_BASE_URL}/api/folders/${folder._id}/star`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (starResponse.ok) {
      setSnackbarMessage("Pasta estrelada com sucesso");
      setShowSnackbar(true);
      window.dispatchEvent(new CustomEvent("folders:updated"));
    } else {
      const errorData = (await starResponse.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      setSnackbarMessage(
        errorData?.error ?? errorData?.message ?? "Failed to star folder",
      );
      setShowSnackbar(true);
    }
  };

  return (
    <>
      {isEditingName && (
        <RenameFolder folder={folder} isEditingName={setIsEditingName} />
      )}

      <div
        ref={menuContainerRef}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20"
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
                handleStarFolder();
                setIsMenuVisible(false);
              }}
            >
              {folder.isStarred ? (
                <IoStar className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              ) : (
                <IoStarOutline className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              )}
              {!folder.isStarred ? "Favoritar" : "Desfavoritar"}
            </button>
            <button
              type="button"
              className="flex flex-row gap-3 items-center w-full text-left px-3 py-2 rounded-lg text-sm text-[#444746] hover:bg-[#e0f7fa] hover:cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                setIsMenuVisible(false);
                setIsEditingName(true);
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
                handleDeleteFolder();
                setIsMenuVisible(false);
              }}
            >
              <HiOutlineTrash className="text-lg text-[#444746] hover:text-[#0d47a1] cursor-pointer w-4 h-4 shrink-0" />
              Deletar
            </button>
          </div>
        )}

        <div
          className="p-2 rounded-full hover:bg-gray-200"
          onClick={(event) => {
            event.stopPropagation();
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
