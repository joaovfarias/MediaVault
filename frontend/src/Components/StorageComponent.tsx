import { BiSolidFileTxt } from "react-icons/bi";
import { BiSolidFileJpg } from "react-icons/bi";
import { BiSolidFilePng } from "react-icons/bi";
import { BsFiletypeMp4 } from "react-icons/bs";
import { BiSolidFilePdf } from "react-icons/bi";

interface File {
  _id: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export default function StorageComponent({ file }: { file: File }) {
  return (
    <>
      <hr className="border-gray-300 mt-3" />
      <div className="mt-4 ml-5 mr-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="shrink-0 text-sm text-gray-700">
            {file.mimeType === "text/plain" && (
              <BiSolidFileTxt className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "image/jpeg" && (
              <BiSolidFileJpg className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "image/png" && (
              <BiSolidFilePng className="text-lg text-[#4285f4]" />
            )}
            {file.mimeType === "video/mp4" && (
              <BsFiletypeMp4 className="text-base text-[#4285f4]" />
            )}
            {file.mimeType === "application/pdf" && (
              <BiSolidFilePdf className="text-base text-[#4285f4]" />
            )}
          </span>
          <span className="truncate text-sm text-gray-700">
            {file.originalName}
          </span>
        </div>
        <span className="shrink-0 text-sm text-gray-700">
          {(file.size / (1024 * 1024)).toFixed(1)} MB
        </span>
      </div>
    </>
  );
}
