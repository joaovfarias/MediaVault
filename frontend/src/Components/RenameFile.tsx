import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";

interface FileRenameProps {
  file: {
    _id: string;
    originalName: string;
    mimeType: string;
  };
  isEditingName: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RenameFile({ file, isEditingName }: FileRenameProps) {
  const [newName, setNewName] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const handleRenameFile = async (
    fileId: string,
    newName: string,
    isEditingName: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (!newName.trim()) {
      alert("Por favor, digite um novo nome para o arquivo");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert("Usuário não autenticado");
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

      isEditingName(false);
      window.dispatchEvent(new CustomEvent("files:updated"));
    } catch (error) {
      console.error("Erro ao renomear o arquivo:", error);
      alert("Erro ao renomear o arquivo");
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
  );
}
