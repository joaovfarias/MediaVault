type FileItem = {
  _id: string;
  originalName: string;
  mimeType: string;
  isStarred: boolean;
  thumbnailUrl: string | null;
};

export default function getFiles(
  setFiles: (files: FileItem[]) => void,
  folderId?: string | null,
) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const token = localStorage.getItem("token") || null;
  if (!token) {
    console.error("No auth token found");
    return;
  }

  const folderQuery =
    folderId === undefined
      ? ""
      : `?folderId=${encodeURIComponent(folderId === null ? "null" : folderId)}`;

  fetch(`${API_BASE_URL}/api/files${folderQuery}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      return response.json();
    })
    .then((data) => setFiles(data))
    .catch((error) => console.error("Error fetching files:", error));
}
