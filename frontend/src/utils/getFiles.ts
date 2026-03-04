type FileItem = {
  _id: string;
  originalName: string;
  mimeType: string;
};

export default function getFiles(setFiles: (files: FileItem[]) => void) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const token =
    localStorage.getItem("token") ||
    (JSON.parse(localStorage.getItem("user") || "{}") as { token?: string })
      .token;
  if (!token) {
    console.error("No auth token found");
    return;
  }

  fetch(`${API_BASE_URL}/api/files`, {
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
