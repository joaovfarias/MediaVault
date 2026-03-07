import { IoIosCloudOutline } from "react-icons/io";
import StorageComponent from "../Components/StorageComponent";
import { getAuthToken } from "../utils/auth";
import { useEffect, useState } from "react";

interface File {
  _id: string;
  originalName: string;
  size: number;
  mimeType: string;
}

interface User {
  name: string;
  storageUsed: number;
}

export default function StoragePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  const token = getAuthToken();

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/files?sortBySize=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const files = await response.json();
        setFiles(files);
        return files;
      } catch (error) {
        console.error("Error fetching files:", error);
        throw error;
      }
    };

    const getUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = await response.json();
        setUser(user);
        return user;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
    };

    getUser();
    getFiles();
  }, [API_BASE_URL, token]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <span className="text-2xl">Armazenamento</span>
        <div className="flex flex-row items-center ml-5">
          <IoIosCloudOutline className="text-2xl text-gray-700 h-8 w-8" />
          <div className="flex flex-col gap-1 items-center ml-10">
            <span className="text-sm text-gray-700">Total usado</span>
            <span className="text-3xl font-light text-gray-900">
              {user?.storageUsed
                ? (user.storageUsed / (1024 * 1024 * 1024)).toFixed(2)
                : "0.00"}{" "}
              GB / 5 GB
            </span>
          </div>
        </div>
        <div className="ml-5 mr-5 flex items-center justify-between gap-4">
          <span className="text-sm text-zinc-700">Nome</span>
          <span className="shrink-0 text-sm text-zinc-700">Tamanho</span>
        </div>
      </div>
      {files.map((file) => (
        <StorageComponent key={file._id} file={file} />
      ))}
    </>
  );
}
