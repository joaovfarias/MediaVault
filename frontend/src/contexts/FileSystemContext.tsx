import { createContext, useContext, useRef, type ReactNode } from "react";

export interface FileRecord {
  _id: string;
  originalName: string;
  mimeType: string;
  isStarred: boolean;
  thumbnailUrl: string | null;
}

export interface FolderRecord {
  _id: string;
  name: string;
  isStarred: boolean;
}

interface FileSystemContextType {
  notifyFilesAdded: (files: FileRecord[]) => void;
  notifyFolderAdded: (folder: FolderRecord) => void;
  setFilesAddedHandler: (fn: ((files: FileRecord[]) => void) | null) => void;
  setFolderAddedHandler: (fn: ((folder: FolderRecord) => void) | null) => void;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const filesHandlerRef = useRef<((files: FileRecord[]) => void) | null>(null);
  const folderHandlerRef = useRef<((folder: FolderRecord) => void) | null>(
    null,
  );

  const value: FileSystemContextType = {
    notifyFilesAdded: (files) => filesHandlerRef.current?.(files),
    notifyFolderAdded: (folder) => folderHandlerRef.current?.(folder),
    setFilesAddedHandler: (fn) => {
      filesHandlerRef.current = fn;
    },
    setFolderAddedHandler: (fn) => {
      folderHandlerRef.current = fn;
    },
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFileSystem = () => {
  const ctx = useContext(FileSystemContext);
  if (!ctx)
    throw new Error("useFileSystem must be used inside FileSystemProvider");
  return ctx;
};
