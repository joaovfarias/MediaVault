import { useState, useEffect } from "react";
import FileComponent from "../Components/FileComponent";
import FolderComponent from "../Components/FolderComponent";

interface StarredFile {
  _id: string;
  originalName: string;
  mimeType: string;
  isStarred: boolean;
  thumbnailUrl: string | null;
}

interface StarredFolder {
  _id: string;
  name: string;
  isStarred: boolean;
}

export default function StarredPage() {
  const [starredFiles, setStarredFiles] = useState<StarredFile[]>([]);
  const [starredFolders, setStarredFolders] = useState<StarredFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

  useEffect(() => {
    const getStarredItems = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);

      try {
        const [filesResponse, foldersResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/files/starred`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/api/folders/starred`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!filesResponse.ok || !foldersResponse.ok) {
          throw new Error("Failed to fetch starred items");
        }

        const filesData = (await filesResponse.json()) as StarredFile[];
        const foldersData = (await foldersResponse.json()) as StarredFolder[];

        setStarredFiles(filesData);
        setStarredFolders(foldersData);
      } catch (error) {
        console.error("Error fetching starred items:", error);
      } finally {
        setLoading(false);
      }
    };
    getStarredItems();

    return () => {};
  }, [API_BASE_URL]);

  const removeFileFromStarred = (fileId: string) => {
    setStarredFiles((prevFiles) =>
      prevFiles.filter((file) => file._id !== fileId),
    );
  };

  const removeFolderFromStarred = (folderId: string) => {
    setStarredFolders((prevFolders) =>
      prevFolders.filter((folder) => folder._id !== folderId),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10 ml-5 mt-5 pr-10">
      {starredFiles?.map((file) => (
        <FileComponent
          key={file._id}
          file={file}
          onUnstar={removeFileFromStarred}
          onDelete={removeFileFromStarred}
        />
      ))}
      {starredFolders?.map((folder) => (
        <FolderComponent
          key={folder._id}
          folder={folder}
          onUnstar={removeFolderFromStarred}
          onDelete={removeFolderFromStarred}
        />
      ))}
    </div>
  );
}
