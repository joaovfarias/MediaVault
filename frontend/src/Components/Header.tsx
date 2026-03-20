import MVLogo from "../assets/MVLogo.png";
import { IoMdSearch } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useRef, useEffect } from "react";
import HelpDialog from "./HelpDialog";

export default function Header() {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // decode token to get user role
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role === "admin";
      }
    } catch {
      // ignore parse errors
    }
    return false;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center w-full p-4 position-fixed top-0 bg-[#f8fafd]">
      <div
        className="flex items-center hover:cursor-pointer"
        onClick={() => (window.location.href = "/")}
      >
        <img src={MVLogo} alt="MediaVault Logo" className="h-10 w-10 mr-2" />
        <h1 className="text-xl text-[#444746] font-light">MediaVault</h1>
      </div>
      <div className="relative w-1/3">
        <input
          type="text"
          placeholder="Pesquise no MediaVault"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006D7A]"
          disabled={true}
        />
        <IoMdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      <div className="flex items-center">
        {isAdmin && (
          <MdOutlineDashboard
            className="text-[#006D7A] mr-6 w-5 h-5 cursor-pointer hover:text-[#004d57]"
            title="Painel Admin"
            onClick={() => navigate("/admin")}
          />
        )}
        <IoMdHelpCircleOutline
          className="text-[#006D7A] mr-6 w-5 h-5 cursor-pointer hover:text-[#004d57]"
          title="Ajuda"
          onClick={() => setIsHelpOpen(true)}
        />
        <div className="relative z-50" ref={menuRef}>
          <FaUser
            className="text-[#006D7A] mr-2 w-5 h-5 cursor-pointer hover:text-[#004d57]"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
          />
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUser className="mr-3 w-4 h-4 text-gray-500" />
                    Meu Perfil
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <IoLogOutOutline className="mr-3 w-4 h-4" />
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {isHelpOpen && <HelpDialog setIsHelpOpen={setIsHelpOpen} />}
    </header>
  );
}
