import FileComponent from "../Components/FileComponent";
import { useState, useEffect } from "react";
import getFiles from "../utils/getFiles";

export default function MyFilesPage() {
  const [files, setFiles] = useState<
    { _id: string; originalName: string; mimeType: string }[]
  >([]);

  useEffect(() => {
    const refreshFiles = () => {
      getFiles(setFiles);
    };

    refreshFiles();
    window.addEventListener("files:updated", refreshFiles);

    return () => {
      window.removeEventListener("files:updated", refreshFiles);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 ml-10 mt-5">
      {files.map(
        (file: { _id: string; originalName: string; mimeType: string }) => (
          <FileComponent key={file._id} file={file} />
        ),
      )}
    </div>
  );
}
