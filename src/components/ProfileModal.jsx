import React, { useEffect, useState, useContext } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LanguageSelector from "./LanguageSelector";
import { Moon, Sun, LogOut, Pencil } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { signOut } from "firebase/auth";

const ProfileModal = ({ onClose }) => {
  const { currentUser } = useContext(AuthContext);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isDark, setIsDark] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");

  useEffect(() => {
    const lang = localStorage.getItem("language") || "en";
    const theme = localStorage.getItem("theme") || "light";

    setSelectedLanguage(lang);
    setIsDark(theme === "dark");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const handleLanguageChange = async (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);

    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), { language: lang });
    }
  };

  const toggleTheme = async () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    if (currentUser) {
      await updateDoc(doc(db, "users", currentUser.uid), { theme: newTheme });
    }
  };

  const handleProfileUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName: name,
        photoURL,
      });

      toast.success("Profile updated");
    } catch (err) {
      toast.error("Error updating profile");
      console.error(err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat-pro");
    formData.append("folder", "ChatPro");

    try {
      toast.loading("Uploading...");
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dtgdvbpxk/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setPhotoURL(data.secure_url);
      toast.dismiss();
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Image upload failed");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
      onClose();
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-6 max-w-md bg-white dark:bg-[#1E1F2B] text-gray-900 dark:text-gray-100">
        <DialogTitle className="text-xl font-semibold mb-4">
          Profile Settings
        </DialogTitle>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Avatar + Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 group">
              <img
                src={photoURL || currentUser?.photoURL}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 dark:border-[#2D2E3E] shadow"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Change photo"
              />
              <div className="absolute bottom-1 right-1 bg-gray-200 dark:bg-[#2D2E3E] rounded-full p-1 shadow-md group-hover:scale-110 transition-transform">
                <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-[#2D2E3E] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Email
            </label>
            <p className="text-sm text-[#2D2E3E] dark:text-gray-200 mt-1">
              {currentUser.email}
            </p>
          </div>

          {/* Language Selector */}
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onChange={handleLanguageChange}
          />

          {/* Theme Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition"
              title="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800" />
              )}
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleProfileUpdate}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition"
          >
            Save Changes
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
