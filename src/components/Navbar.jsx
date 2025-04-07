import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import ProfileModal from "./ProfileModal";
import { MoreVertical } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { ChatContext } from "@/context/ChatContext";
import Logo from "../assets/avatar.jpg"; // Add your logo here

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dispatch } = useContext(ChatContext);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      dispatch({ type: "RESET_CHAT" });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="relative min-h-16 px-4 py-3 flex items-center justify-between border-b-[1px] dark:border-[#7e819d] bg-white dark:bg-[#1E1F2B]">
      {/* ChatPro Logo and Name */}
      <div className="flex items-center gap-3">
        <img
          src="logo.png"
          alt="ChatPro"
          className="w-5 h-6 rounded object-cover hidden dark:block"
        />
        <img
          src="light-logo.png"
          alt="ChatPro"
          className="w-5 h-6 rounded object-cover block dark:hidden"
        />
        <span className="text-lg font-semibold text-gray-800 dark:text-white">
          ChatPro
        </span>
      </div>

      {/* 3-dot menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-20">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {isModalOpen && <ProfileModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Navbar;
