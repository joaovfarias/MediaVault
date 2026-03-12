import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";
import FeedbackComponent from "./FeedbackComponent";

interface FileRenameProps {
  file: {
    _id: string;
    originalName: string;
    mimeType: string;
  };
  isEditingName: React.Dispatch<React.SetStateAction<boolean>>;
  onRename?: (fileId: string, newName: string) => void;
}

function removeExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

export default function RenameFile({
  file,
  isEditingName,
  onRename,
}: FileRenameProps) {
  const [newName, setNewName] = useState(removeExtension(file.originalName));
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleRenameFile = async (
    fileId: string,
    newName: string,
    isEditingName: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!newName.trim()) {
      setShowFeedback(true);
      setFeedbackMessage("Por favor, digite um novo nome para o arquivo");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setShowFeedback(true);
      setFeedbackMessage("Usuário não autenticado");
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/files/${fileId}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newName }),
        },
      );

      if (!response.ok) {
        throw new Error("Falha ao renomear o arquivo");
      }

      const ext = file.originalName.includes(".")
        ? file.originalName.substring(file.originalName.lastIndexOf("."))
        : "";
      isEditingName(false);
      onRename?.(fileId, newName.trim() + ext);
    } catch (error) {
      console.error("Erro ao renomear o arquivo:", error);
      setShowFeedback(true);
      setFeedbackMessage("Erro ao renomear o arquivo");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={() => isEditingName(false)}
      >
        <div
          className="bg-white p-6 rounded-lg flex flex-col gap-4 w-1/5"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-2xl font-light">Renomear</p>
          <input
            type="text"
            placeholder="Novo nome do arquivo"
            className="border border-[#006D7A] rounded-md p-2 w-full focus:outline-none focus:ring-1 focus:ring-[#006D7A]"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-sm cursor-pointer"
              onClick={() => isEditingName(false)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded-md bg-[#006D7A] hover:bg-[#005662] text-white text-sm cursor-pointer"
              onClick={() => handleRenameFile(file._id, newName, isEditingName)}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>

      {showFeedback && (
        <FeedbackComponent
          message={feedbackMessage}
          severity="error"
          open={showFeedback}
          handleClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}
