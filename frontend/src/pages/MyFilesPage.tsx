import FileComponent from "../Components/FileComponent";
import FolderComponent from "../Components/FolderComponent";
import { useState, useEffect } from "react";
import getFiles from "../utils/getFiles";
import getFolders from "../utils/getFolders";
import { useParams } from "react-router-dom";

export default function MyFilesPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [files, setFiles] = useState<
    { _id: string; originalName: string; mimeType: string }[]
  >([]);
  const [folders, setFolders] = useState<{ _id: string; name: string }[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getToken = () =>
    localStorage.getItem("token") ||
    (JSON.parse(localStorage.getItem("user") || "{}") as { token?: string })
      .token ||
    null;

  useEffect(() => {
    const refreshData = () => {
      if (!folderId) {
        getFiles(setFiles, null);
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
        .then(
          (data: {
            files?: { _id: string; originalName: string; mimeType: string }[];
          }) => {
            setFiles(data.files ?? []);
          },
        )
        .catch(() => {
          setFiles([]);
        });

      getFolders(setFolders, folderId);
    };

    refreshData();
    window.addEventListener("files:updated", refreshData);
    window.addEventListener("folders:updated", refreshData);

    return () => {
      window.removeEventListener("files:updated", refreshData);
      window.removeEventListener("folders:updated", refreshData);
    };
  }, [folderId, API_BASE_URL]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10 ml-5 mt-5 pr-10">
      {files.map(
        (file: { _id: string; originalName: string; mimeType: string }) => (
          <FileComponent key={file._id} file={file} />
        ),
      )}
      {folders.map((folder: { _id: string; name: string }) => (
        <FolderComponent key={folder._id} folder={folder} />
      ))}
    </div>
  );
}
