import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import ReactMarkdown from "react-markdown";
import fallbackAvatar from "../assets/avatar.jpg";
import Lottie from "lottie-react";
import emptyAnimation from "../assets/startchat.json";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();
  const [statusLabel, setStatusLabel] = useState("");

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  useEffect(() => {
    switch (message.status) {
      case "read":
        setStatusLabel("✓✓✓");
        break;
      case "delivered":
        setStatusLabel("✓✓");
        break;
      default:
        setStatusLabel("✓");
        break;
    }
  }, [message.status]);

  const avatarUrl =
    message.senderId === currentUser.uid
      ? currentUser.photoURL || fallbackAvatar
      : data.user.photoURL || fallbackAvatar;

  if (!message || (!message.text1 && !message.text2 && !message.img)) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-10">
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          className="w-64 h-64"
        />
        <p className="text-gray-500 dark:text-gray-400 mt-4">
          Start your first conversation!
        </p>
      </div>
    );
  }

  const isOwn = message.senderId === currentUser.uid;

  return (
    <div
      ref={ref}
      className={`flex w-full px-4 py-2 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end gap-2 max-w-[80%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-8 h-8 rounded-full object-cover shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackAvatar;
          }}
        />

        <div
          className={`relative px-3 py-2 rounded-xl text-sm whitespace-pre-line break-words shadow-sm transition-all duration-200 ${
            isOwn
              ? "bg-blue-500 text-white dark:text-gray-100 rounded-br-none"
              : "bg-[#252634] text-[#A3A4B5] dark:bg-[#252634] dark:text-gray-100 rounded-bl-none"
          }`}
        >
          {message.img && (
            <div className="mt-2 w-60 pb-2 h-auto rounded-md overflow-hidden">
              <img
                src={message.img}
                alt="attachment"
                className="object-cover"
              />
            </div>
          )}
          <ReactMarkdown>
            {currentUser.uid === message.user1 ? message.text1 : message.text2}
          </ReactMarkdown>

          <div className="flex justify-end items-center gap-1 mt-1">
            <span className="text-[10px] text-white/70 dark:text-gray-300">
              {message.date?.toDate().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {isOwn && (
              <span className="text-[10px] text-white/70 dark:text-gray-300">
                {statusLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
