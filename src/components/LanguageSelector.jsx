import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const LanguageSelector = () => {
  const { currentUser, userData, setUserData } = useContext(AuthContext);
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    // Sync with Firestore if available
    if (userData?.language) {
      setSelectedLanguage(userData.language);
    }
  }, [userData]);

  const handleChange = async (lang) => {
    setSelectedLanguage(lang);
    localStorage.setItem("language", lang);

    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { language: lang });
      setUserData((prev) => ({ ...prev, language: lang }));
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-normal mb-2 text-gray-700 dark:text-gray-200">
        Preferred Language
      </label>
      <select
        value={selectedLanguage}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-2 px-4 rounded-md dark:bg-[#2D2E3E] bg-gray-100 dark:text-white 
    outline-none focus:outline focus:outline-blue-500"
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
