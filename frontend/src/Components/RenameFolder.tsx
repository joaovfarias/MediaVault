import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";

interface FolderRenameProps {
  folder: {
    _id?: string;
    name: string;
  };
  isEditingName: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RenameFolder({
  folder,
  isEditingName,
}: FolderRenameProps) {
  const [newName, setNewName] = useState(folder.name);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleRenameFolder = async (
    folderId: string,
    newName: string,
    isEditingName: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert("Por favor, digite um novo nome para a pasta");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert("Usuário não autenticado");
      return;
    }
    if (!folderId) {
      alert("ID da pasta não disponível");
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

      isEditingName(false);
      window.dispatchEvent(new CustomEvent("folders:updated"));
    } catch (error) {
      console.error("Erro ao renomear a pasta:", error);
      alert(
        error instanceof Error ? error.message : "Erro ao renomear a pasta",
      );
    }
  };

  return (
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
  );
}
