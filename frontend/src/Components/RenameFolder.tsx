import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";
import FeedbackComponent from "./FeedbackComponent";

interface FolderRenameProps {
  folder: {
    _id?: string;
    name: string;
  };
  isEditingName: React.Dispatch<React.SetStateAction<boolean>>;
  onRename?: (folderId: string, newName: string) => void;
}

export default function RenameFolder({
  folder,
  isEditingName,
  onRename,
}: FolderRenameProps) {
  const [newName, setNewName] = useState(folder.name);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleRenameFolder = async (
    folderId: string,
    newName: string,
    isEditingName: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setShowFeedback(true);
      setFeedbackMessage("Por favor, digite um novo nome para a pasta");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setShowFeedback(true);
      setFeedbackMessage("Usuário não autenticado");
      return;
    }
    if (!folderId) {
      setShowFeedback(true);
      setFeedbackMessage("ID da pasta não disponível");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newName: trimmedName }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        throw new Error(
          errorData?.error ?? errorData?.message ?? "Falha ao renomear a pasta",
        );
      }

      const updatedFolder = (await response.json().catch(() => null)) as {
        name?: string;
      } | null;
      isEditingName(false);
      onRename?.(folderId, updatedFolder?.name ?? trimmedName);
    } catch (error) {
      console.error("Erro ao renomear a pasta:", error);
      setShowFeedback(true);
      setFeedbackMessage(
        error instanceof Error ? error.message : "Erro ao renomear a pasta",
      );
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
            placeholder="Novo nome da pasta"
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
              onClick={() =>
                handleRenameFolder(folder._id ?? "", newName, isEditingName)
              }
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
