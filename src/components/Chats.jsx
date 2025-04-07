import {
  doc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { format } from "date-fns";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(window.innerWidth);
  const { currentUser } = useContext(AuthContext);
  const { dispatch, data } = useContext(ChatContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setStatus(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let unsub;
    if (currentUser.uid) {
      unsub = onSnapshot(
        doc(db, "userChats", currentUser.uid),
        (docSnap) => {
          if (docSnap.exists()) {
            setChats(docSnap.data());
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error getting document:", error);
          setLoading(false);
        }
      );
    }

    return () => unsub && unsub();
  }, [currentUser.uid]);

  const handleSelect = async (u) => {
    const combinedId =
      currentUser.uid > u.uid
        ? currentUser.uid + "_" + u.uid
        : u.uid + "_" + currentUser.uid;

    try {
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [`${combinedId}.unreadCount`]: 0,
        [`${combinedId}.date`]: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to reset unread count:", err);
    }

    status <= 768 ? navigate("/chat") : navigate("/");
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const renderSkeletons = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="w-6 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    ));
  };

  return (
    <div className="chats space-y-2 p-2 overflow-y-auto dark:bg-[#2d2e3e]">
      {loading
        ? renderSkeletons()
        : Object.entries(chats)
            ?.sort((a, b) => b[1].date - a[1].date)
            .map(([chatId, chat], index, array) => {
              const { userInfo, lastMessage, unreadCount } = chat;
              const isActive = chatId === data.chatId;

              return (
                <React.Fragment key={chatId}>
                  <div
                    onClick={() => handleSelect(userInfo)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl transition cursor-pointer
                ${
                  isActive
                    ? "bg-blue-100 dark:bg-[#1E1F2B]"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                  >
                    {/* Left Side */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={userInfo.photoURL}
                          alt={userInfo.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {userInfo.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold pb-1 text-sm text-gray-900 dark:text-white">
                          {userInfo.displayName}
                        </p>
                        <p
                          className={`text-xs max-w-[180px] truncate ${
                            unreadCount > 0
                              ? "text-gray-900 dark:text-[#A3A4B5] font-medium"
                              : "text-gray-500 dark:text-[#A3A4B5]"
                          }`}
                        >
                          {lastMessage
                            ? lastMessage?.length > 20
                              ? lastMessage.slice(0, 20) + "..."
                              : lastMessage + "..."
                            : "Start chatting..."}
                        </p>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-1">
                      {chat.date?.toDate && (
                        <span className="text-[10px] text-gray-400 dark:text-[#A3A4B5]">
                          {format(chat.date.toDate(), "hh:mm a")}
                        </span>
                      )}

                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Divider between chats, not after the last one */}
                  {index < array.length - 1 && (
                    <div className="flex justify-center">
                      <div className="w-[90%] h-[0.5px] bg-gray-300 dark:bg-[#7e819d] rounded-full" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
    </div>
  );
};

export default Chats;
