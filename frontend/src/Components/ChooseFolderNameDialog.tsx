import { useState } from "react";
import { getAuthToken } from "../utils/auth";

interface FolderRenameProps {
  open: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export default function ChooseFolderNameDialog({
  onClose,
  parentId,
}: FolderRenameProps) {
  const [newName, setNewName] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleCreateFolder = async (newName: string) => {
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/folders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmedName, parentId: parentId ?? null }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
          message?: string;
        } | null;
        throw new Error(
          errorData?.error ?? errorData?.message ?? "Falha ao criar a pasta",
        );
      }

      window.dispatchEvent(new CustomEvent("folders:updated"));
      onClose();
    } catch (error) {
      console.error("Erro ao criar a pasta:", error);
      alert(error instanceof Error ? error.message : "Erro ao criar a pasta");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onClose()}
    >
      <div
        className="bg-white p-6 rounded-lg flex flex-col gap-4 w-1/5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-2xl font-light">Criar Pasta</p>
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
            onClick={() => onClose()}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-md bg-[#006D7A] hover:bg-[#005662] text-white text-sm cursor-pointer"
            onClick={() => handleCreateFolder(newName)}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
