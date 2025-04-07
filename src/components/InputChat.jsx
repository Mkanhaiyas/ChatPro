// ChatInput.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import { Mic } from "lucide-react";
import axios from "axios";
import InputField from "./InputField";
import SendButton from "./SendButton";

const displayLang = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  "zh-Hans": "Chinese",
};

const ChatInput = () => {
  const [text1, setText1] = useState("");
  const [img, setImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [mess, setMess] = useState("en");
  const [currLang, setCurrLang] = useState("en");
  const RAPID_API = import.meta.env.VITE_RAPID_API_KEY;
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const { data } = useContext(ChatContext);
  const currentUser = useRef(useContext(AuthContext));
  const Lang = currentUser.current.currentUser.uid;
  const User = data.chatId ? data.chatId.split("_") : ["", ""];
  const Compare = User[0] === Lang ? User[1] : User[0];
  const ChatBot = `FGmfyvWO55XPkxHsAchme8lJEy03`;

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Browser doesn't support speech recognition");
    }
    setText1(transcript);
  }, [transcript]);

  useEffect(() => {
    if (img) {
      const url = URL.createObjectURL(img);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [img]);

  // const fetchLang = async () => {
  //   try {
  //     const userDoc = await getDoc(doc(db, "users", Lang));
  //     if (userDoc.exists()) setCurrLang(userDoc.data().language);
  //   } catch (err) {
  //     console.error("Language fetch error:", err);
  //   }
  // };

  const startListening = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", Lang));
      const latestLang = userDoc.exists() ? userDoc.data().language : "en";
      setCurrLang(latestLang);
      SpeechRecognition.startListening({ language: latestLang });
    } catch (err) {
      console.error("Mic Language fetch error:", err);
      SpeechRecognition.startListening({ language: "en" });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!Compare) return;
    const unSub = onSnapshot(doc(db, "users", Compare), (docSnap) => {
      docSnap.exists() && setMess(docSnap.data().language);
    });
    return () => unSub();
  }, [data.chatId]);

  const sendBotReply = async () => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful assistant. Always reply in ${displayLang.currLang} no matter the input language.`,
                },
                {
                  text: text1,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const reply =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
      console.log("Gemini Reply:", response);

      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          user1: User[0],
          user2: User[1],
          text1: reply,
          text2: reply,
          senderId: Compare,
          date: Timestamp.now(),
          translationSuccess: true,
        }),
      });

      await updateDoc(doc(db, "userChats", Lang), {
        [data.chatId + ".lastMessage"]: reply,
        [data.chatId + ".date"]: serverTimestamp(),
      });
      return reply;
    } catch (error) {
      console.error(
        "Gemini API Error:",
        error?.response?.data || error.message
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text1.trim() && !img) return;

    if (Compare === ChatBot) {
      await updateDoc(doc(db, "chats", data.chatId), {
        messages: arrayUnion({
          id: uuid(),
          user1: User[0],
          user2: User[1],
          text1: text1,
          text2: text1,
          senderId: Lang,
          date: Timestamp.now(),
          translationSuccess: true,
        }),
      });
      await sendBotReply();
      setText1("");
      setImg(null);
      setPreviewUrl(null);
      return;
    }

    let translated = text1;
    let translationSuccess = true;

    if (mess !== currLang && text1) {
      try {
        console.log(RAPID_API);
        const response = await axios.post(
          "https://deep-translate1.p.rapidapi.com/language/translate/v2",
          { q: text1, source: currLang, target: mess },
          {
            headers: {
              "content-type": "application/json",
              "x-rapidapi-key": RAPID_API,
              "x-rapidapi-host": "deep-translate1.p.rapidapi.com",
            },
          }
        );
        translated = response.data.data.translations.translatedText[0];
        console.log(response.data.data.translations.translatedText[0]);
      } catch (err) {
        console.error("Translation error:", err);
        translationSuccess = false;
      }
    }

    const messageObj = {
      id: uuid(),
      user1: User[0],
      user2: User[1],
      text1: Lang === User[0] ? text1 : translated,
      text2: Lang === User[0] ? translated : text1,
      senderId: Lang,
      date: Timestamp.now(),
      translationSuccess,
    };

    if (img) {
      const formData = new FormData();
      formData.append("file", img);
      formData.append("upload_preset", "chat-pro");
      formData.append("folder", "ChatPro");

      try {
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dtgdvbpxk/image/upload",
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );
        messageObj.img = uploadRes.data.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion(messageObj),
    });

    await Promise.all([
      updateDoc(doc(db, "userChats", User[0]), {
        [data.chatId + ".lastMessage"]: text1,
        [data.chatId + ".date"]: serverTimestamp(),
      }),
      updateDoc(doc(db, "userChats", User[1]), {
        [data.chatId + ".lastMessage"]: translated,
        [data.chatId + ".date"]: serverTimestamp(),
      }),
    ]);

    setText1("");
    setImg(null);
    setPreviewUrl(null);
    setUploadProgress(null);
  };

  return (
    <div
      className="w-[80%] max-w-4xl z-50 rounded-xl px-2 py-2 border-2 shadow-lg 
  fixed lg:absolute bottom-12 lg:bottom-14 gap-3 flex flex-col 
  bg-gray-100 dark:bg-[#2d2e3e] border-gray-300 dark:border-[#7e819d] 
  left-1/2 -translate-x-1/2 transition-colors duration-300"
    >
      {previewUrl && (
        <div className="relative w-32 h-32 rounded-xl shadow-md">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl"
          />
          <button
            onClick={() => {
              setPreviewUrl(null);
              setImg(null);
              setUploadProgress(null);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
            title="Remove image"
          >
            ✕
          </button>
          {uploadProgress !== null && uploadProgress < 100 && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-200 dark:bg-gray-600 rounded-b-xl overflow-hidden">
              <div
                className="bg-blue-500 h-1"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 w-full px-1">
        {/* ✏️ Input Field */}
        <div className="flex-1 relative">
          <InputField text={text1} setText={setText1} setImg={setImg} />
        </div>
        {/* 🎤 Voice Button */}
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          className={`w-10 h-8 md:w-6 md:h-6 lg:h-9 lg:w-9 flex items-center justify-center rounded-full 
            bg-none text-gray-500 dark:text-gray-300 hover:text-white transition-all duration-300 ease-in-out
            ${
              listening
                ? "bg-blue-700 scale-110 animate-pulse text-white"
                : "hover:bg-blue-600"
            }`}
          title="Hold to Speak"
        >
          <Mic className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div className="h-6 border-l border-gray-400 dark:border-gray-600 mx-2" />

        {/* 🚀 Send Button */}
        <div>
          <SendButton onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
