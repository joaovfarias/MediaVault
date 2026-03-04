import { HiOutlinePlus } from "react-icons/hi2";
import { IoHomeOutline } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import { IoIosCloudOutline } from "react-icons/io";
import { NavLink } from "react-router-dom";
import NewUploadBar from "./NewUploadBar";
import { useEffect, useRef, useState } from "react";

export default function Sidebar() {
  const [isUploadBarVisible, setIsUploadBarVisible] = useState(false);
  const [isUploadBarOpen, setIsUploadBarOpen] = useState(false);
  const uploadBarContainerRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const animationDuration = 200;

  const openUploadBar = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsUploadBarVisible(true);
    requestAnimationFrame(() => setIsUploadBarOpen(true));
  };

  const closeUploadBar = () => {
    setIsUploadBarOpen(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsUploadBarVisible(false);
      closeTimeoutRef.current = null;
    }, animationDuration);
  };

  const toggleUploadBar = () => {
    if (isUploadBarOpen) {
      closeUploadBar();
      return;
    }

    openUploadBar();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isUploadBarVisible) {
        return;
      }

      if (
        uploadBarContainerRef.current &&
        !uploadBarContainerRef.current.contains(event.target as Node)
      ) {
        closeUploadBar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isUploadBarVisible]);

  return (
    <aside className="w-1/8 bg-[#f8fafd] h-screen p-4 position-fixed top-0 left-0 rounded-tr-lg">
      <nav className="mt-2">
        <ul>
          <li className="mb-4 relative" ref={uploadBarContainerRef}>
            <button
              onClick={toggleUploadBar}
              className="border border-gray-300 rounded-full p-4 w-1/2 bg-white hover:bg-[#e0f7fa] hover:cursor-pointer"
            >
              <div className="flex items-center">
                <HiOutlinePlus className="mr-2 w-5 h-5 text-[#000000]" />
                <p className="text-sm font-light">Novo</p>
              </div>
            </button>
            {isUploadBarVisible && (
              <div className="absolute mt-2 left-0 z-10">
                <NewUploadBar isVisible={isUploadBarOpen} />
              </div>
            )}
          </li>
          <li className="mb-4">
            <NavLink
              to="/files"
              className={({ isActive }) =>
                `block py-2 px-4 rounded hover:bg-[#e0f7fa] ${isActive ? "bg-[#e0f7fa]" : ""}`
              }
            >
              <div className="flex items-center">
                <IoHomeOutline className="mr-2 w-4 h-4 text-[#000000]" />
                <p className="text-sm font-light">Meus Arquivos</p>
              </div>
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/trash"
              className={({ isActive }) =>
                `block py-2 px-4 rounded hover:bg-[#e0f7fa] ${isActive ? "bg-[#e0f7fa]" : ""}`
              }
            >
              <div className="flex items-center">
                <GoTrash className="mr-2 w-4 h-4 text-[#000000]" />
                <p className="text-sm font-light">Lixeira</p>
              </div>
            </NavLink>
          </li>
          <li className="mb-4">
            <NavLink
              to="/storage"
              className={({ isActive }) =>
                `block py-2 px-4 rounded hover:bg-[#e0f7fa] ${isActive ? "bg-[#e0f7fa]" : ""}`
              }
            >
              <div className="flex items-center">
                <IoIosCloudOutline className="mr-2 w-4 h-4 text-[#000000]" />
                <p className="text-sm font-light">Armazenamento</p>
              </div>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
