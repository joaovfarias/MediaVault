type FolderItem = {
  _id: string;
  name: string;
  isStarred: boolean;
};

export default function getFolders(
  setFolders: (folders: FolderItem[]) => void,
  parentId?: string,
) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const token = localStorage.getItem("token") || null;
  if (!token) {
    console.error("No auth token found");
    return;
  }

  const query = parentId ? `?parentId=${encodeURIComponent(parentId)}` : "";

  fetch(`${API_BASE_URL}/api/folders${query}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      return response.json();
    })
    .then((data) => setFolders(data))
    .catch((error) => console.error("Error fetching folders:", error));
}
