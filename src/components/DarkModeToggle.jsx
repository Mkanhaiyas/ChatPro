// src/components/DarkModeToggle.jsx
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { debounce } from "lodash";

const DarkModeToggle = () => {
  const { currentUser, userData, setUserData } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  // Use theme from Firestore on load
  useEffect(() => {
    if (userData?.theme) {
      setDarkMode(userData.theme === "dark");
    }
  }, [userData]);

  // Sync theme to DOM, localStorage, and Firestore
  useEffect(() => {
    const root = window.document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Update Firestore (debounced)
    if (currentUser) {
      updateThemeInFirestore(darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  // Sync theme across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        setDarkMode(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Debounced update to Firestore
  const updateThemeInFirestore = debounce(async (theme) => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, { theme });

    setUserData((prev) => ({
      ...prev,
      theme,
    }));
  }, 500);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      aria-pressed={darkMode}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
      title="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle {darkMode ? "light" : "dark"} mode</span>
      {darkMode ? (
        <Sun size={18} className="text-yellow-300" />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
};

export default DarkModeToggle;
