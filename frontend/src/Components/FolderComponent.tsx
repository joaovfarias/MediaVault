import { FaFolder } from "react-icons/fa";
import FolderSettings from "./FolderSettings";
import { useNavigate } from "react-router-dom";

export default function FolderComponent({
  folder = { name: "New Folder" },
}: {
  folder?: { _id?: string; name: string };
}) {
  const navigate = useNavigate();

  const handleOpenFolder = () => {
    if (!folder._id) {
      return;
    }

    navigate(`/files/folder/${folder._id}`);
  };

  return (
    <div className="relative w-fit">
      <div
        className="relative flex flex-col text-black bg-[#f0f4f9] p-4 rounded-xl w-55 h-16 hover:bg-[#e0e8f1] cursor-pointer"
        onClick={handleOpenFolder}
      >
        <div className="flex-1 flex items-center justify-start gap-2 pr-8">
          <FaFolder className="text-2xl text-[#444746] group-hover:text-[#333536]" />
          <span className="text-base flex-1 text-center truncate">
            {folder.name}
          </span>
        </div>
      </div>

      <FolderSettings folder={folder} />
    </div>
  );
}
