import FileComponent from "../Components/FileComponent";
import FolderComponent from "../Components/FolderComponent";
import { useState, useEffect } from "react";
import getFiles from "../utils/getFiles";
import getFolders from "../utils/getFolders";
import { useParams } from "react-router-dom";
import { useFileSystem } from "../contexts/FileSystemContext";

interface File {
  _id: string;
  originalName: string;
  mimeType: string;
  isStarred: boolean;
  thumbnailUrl: string | null;
}

interface Folder {
  _id: string;
  name: string;
  isStarred: boolean;
}

export default function MyFilesPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setFilesAddedHandler, setFolderAddedHandler } = useFileSystem();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getToken = () =>
    localStorage.getItem("token") ||
    (JSON.parse(localStorage.getItem("user") || "{}") as { token?: string })
      .token ||
    null;

  useEffect(() => {
    const refreshData = () => {
      setLoading(true);
      if (!folderId) {
        getFiles((f) => {
          setFiles(f);
          setLoading(false);
        }, null);
        getFolders(setFolders);
        return;
      }

      const token = getToken();
      if (!token) {
        setFiles([]);
        setFolders([]);
        return;
      }

      fetch(`${API_BASE_URL}/api/folders/${folderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch folder details");
          }
          return response.json();
        })
        .then((data: { files?: File[] }) => {
          setFiles(data.files ?? []);
        })
        .catch(() => {
          setFiles([]);
        })
        .finally(() => setLoading(false));

      getFolders(setFolders, folderId);
    };

    refreshData();

    return () => {};
  }, [folderId, API_BASE_URL]);

  useEffect(() => {
    setFilesAddedHandler((newFiles) => {
      setFiles((prev) => [...prev, ...newFiles]);
    });
    setFolderAddedHandler((newFolder) => {
      setFolders((prev) => [...prev, newFolder]);
    });

    return () => {
      setFilesAddedHandler(null);
      setFolderAddedHandler(null);
    };
  }, [setFilesAddedHandler, setFolderAddedHandler]);

  const filterOptions = [
    { label: "Todos", value: null },
    { label: "Imagens", value: "image" },
    { label: "PDF", value: "application/pdf" },
    { label: "Vídeos", value: "video/mp4" },
    { label: "Texto", value: "text/plain" },
  ];

  const filteredFiles = typeFilter
    ? files.filter((f) => f.mimeType.startsWith(typeFilter))
    : files;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-gray-500 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 ml-5 mt-4 mb-2 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setTypeFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              typeFilter === opt.value
                ? "bg-[#006D7A] text-white border-[#006D7A]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10 ml-5 mt-5 pr-10">
        {filteredFiles.map((file: File) => (
          <FileComponent
            key={file._id}
            file={file}
            variant="MyFilesPage"
            onDelete={(fileId) =>
              setFiles((prev) => prev.filter((f) => f._id !== fileId))
            }
            onRename={(fileId, newName) =>
              setFiles((prev) =>
                prev.map((f) =>
                  f._id === fileId ? { ...f, originalName: newName } : f,
                ),
              )
            }
          />
        ))}
        {!typeFilter &&
          folders.map((folder: Folder) => (
            <FolderComponent
              key={folder._id}
              folder={folder}
              variant="MyFilesPage"
              onDelete={(folderId) =>
                setFolders((prev) => prev.filter((fo) => fo._id !== folderId))
              }
              onRename={(folderId, newName) =>
                setFolders((prev) =>
                  prev.map((fo) =>
                    fo._id === folderId ? { ...fo, name: newName } : fo,
                  ),
                )
              }
            />
          ))}
      </div>
    </div>
  );
}
