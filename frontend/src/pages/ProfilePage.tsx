import { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";
import { FaUser } from "react-icons/fa";

interface User {
  _id: string;
  username: string;
  email: string;
  storageUsed: number;
  role: string;
  createdAt: string;
  fileCount: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const token = getAuthToken();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = (await response.json()) as User;
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [API_BASE_URL, token]);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <span className="text-2xl">Meu Perfil</span>
      <div className="ml-5 flex items-center gap-5">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#006D7A]">
          <FaUser className="text-white w-7 h-7" />
        </div>
        <div>
          <p className="text-xl text-gray-900">{user.username}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="ml-5 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Cargo</p>
          <p className="text-lg text-gray-900 mt-1">
            {user.role === "admin" ? "Admin" : "Usuário"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Armazenamento Usado</p>
          <p className="text-lg text-gray-900 mt-1">
            {formatStorage(user.storageUsed)} / 5 GB
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Quantidade de Arquivos</p>
          <p className="text-lg text-gray-900 mt-1">{user.fileCount} / 200</p>
        </div>
      </div>
    </div>
  );
}
