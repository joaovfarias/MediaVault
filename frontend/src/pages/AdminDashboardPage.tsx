import { useEffect, useState } from "react";
import { getAuthToken } from "../utils/auth";

interface User {
  _id: string;
  username: string;
  email: string;
  storageUsed: number;
  role: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
  const token = getAuthToken();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard");

        const data = (await response.json()) as { users: User[] };
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [API_BASE_URL, token]);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const totalStorage = users.reduce((sum, u) => sum + u.storageUsed, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <span className="text-2xl">Painel do Administrador</span>

      <div className="flex gap-6 ml-5">
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center min-w-40">
          <span className="text-sm text-gray-500">Total de Usuários</span>
          <span className="text-3xl font-light text-gray-900 mt-1">
            {users.length}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center min-w-40">
          <span className="text-sm text-gray-500">
            Armazenamento Total Usado
          </span>
          <span className="text-3xl font-light text-gray-900 mt-1">
            {formatStorage(totalStorage)}
          </span>
        </div>
      </div>

      <div className="ml-5 mr-5">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-3 text-sm font-medium text-zinc-700">
                Usuário
              </th>
              <th className="py-3 text-sm font-medium text-zinc-700">Email</th>
              <th className="py-3 text-sm font-medium text-zinc-700">Cargo</th>
              <th className="py-3 text-sm font-medium text-zinc-700 text-right">
                Armazenamento Usado
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-3 text-sm text-gray-700">{user.username}</td>
                <td className="py-3 text-sm text-gray-700">{user.email}</td>
                <td className="py-3 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-[#006D7A] text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "Usuário"}
                  </span>
                </td>
                <td className="py-3 text-sm text-gray-700 text-right">
                  {formatStorage(user.storageUsed)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
