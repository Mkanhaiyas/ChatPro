import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe2, Moon, Sun } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import Messages from "./Messages";
import ChatInput from "./InputChat";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Dictionary for language display names
const displayLang = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  "zh-Hans": "Chinese",
};

const Chat = () => {
  const { data } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const [isLangUpdating, setIsLangUpdating] = useState(false);
  const [langCode, setLangCode] = useState("en");
  const [toggle, setToggle] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();

  // Apply dark/light theme to HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const storedLang = docSnap.data().language || "en";
          setLangCode(storedLang);
        }
      } catch (error) {
        console.error("Failed to fetch language:", error);
      }
    };

    fetchLanguage();
  }, [currentUser.uid]);

  const handleLanguageChange = async (newLangCode) => {
    setToggle(false);
    setIsLangUpdating(true); // ✅ Start loading
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { language: newLangCode });

      setLangCode(newLangCode);
      toast.success(`Language updated to ${displayLang[newLangCode]}`);
    } catch (error) {
      console.error("Failed to update language:", error);
      toast.error("Failed to update language");
    } finally {
      setIsLangUpdating(false); // ✅ End loading
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full relative bg-white dark:bg-[#2d2e3e] transition-colors duration-300">
      {/* Header */}
      <div
        className="flex justify-between items-center w-full absolute top-0 z-50 px-4 py-3 min-h-16 
  bg-white/10 dark:bg-[#1E1F2B]/50 
  backdrop-blur-xl shadow-md border-b border-white/10 "
      >
        {/* Left: Back + User Info */}
        <div className="flex items-center gap-2">
          <button onClick={handleBack}>
            <ArrowLeft className="w-5 h-5 text-[#A3A4B5]" />
          </button>
          {data.user?.photoURL && (
            <img
              src={data.user.photoURL}
              alt={data.user.displayName}
              className="w-9 h-9 rounded-full object-cover"
            />
          )}
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {data.user?.displayName}
          </span>
        </div>

        {/* Right: Language + Theme Toggle */}
        <div className="flex items-center gap-5 pr-10">
          <div className="relative">
            <button
              onClick={() => setToggle((prev) => !prev)}
              className="flex items-center gap-1"
            >
              <Globe2 className="w-5 h-5 text-[#A3A4B5]" />
              <span className="text-sm text-[#A3A4B5]">
                {displayLang[langCode] || "Unknown"}
              </span>
            </button>

            <AnimatePresence>
              {toggle && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-32 bg-[#2D2E3E] border border-white/10 backdrop-blur-md rounded shadow-md z-10"
                >
                  {isLangUpdating ? (
                    <div className="flex items-center justify-center px-4 py-3 text-sm text-white">
                      Updating...
                      <span className="ml-2 w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    Object.entries(displayLang).map(([code, label]) => (
                      <div
                        key={code}
                        onClick={() => handleLanguageChange(code)}
                        className="px-4 py-2 text-sm text-white hover:bg-[#4B3DFF]/10 cursor-pointer"
                      >
                        {label}
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Theme Toggle */}
          <button onClick={() => setIsDark((prev) => !prev)}>
            {isDark ? (
              <Moon className="w-5 h-5 text-white" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <Messages />
      <ChatInput language={langCode} />

      {/* Bottom Background */}
      {/* <div className="h-24 lg:h-24 z-0 w-full bottom-0 bg-[url('gravel.webp')] dark:bg-[url('gravel.webp')]"></div> */}
    </div>
  );
};

export default Chat;
