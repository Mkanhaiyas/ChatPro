import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!data.chatId) return;
    const unsub = onSnapshot(doc(db, "chats", data.chatId), (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      }
    });

    return () => unsub();
  }, [data.chatId]);

  const groupByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = dayjs(msg.date?.toDate?.() || msg.date).format("YYYY-MM-DD");
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const getDisplayDate = (dateStr) => {
    const date = dayjs(dateStr);
    const today = dayjs();
    if (date.isSame(today, "day")) return "Today";
    if (date.isSame(today.subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMMM D, YYYY");
  };

  const groupedMessages = groupByDate(messages);

  return (
    <div
      className={`messages flex-1 overflow-y-auto pb-36 pt-20
        ${messages.length === 0 ? "flex items-center justify-center" : "p-4"}
        bg-[url('gravel.webp')] dark:bg-[url('type.webp')]
        transition-colors duration-300
      `}
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm h-screen">
          No messages yet
        </div>
      ) : (
        Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-4">
              {getDisplayDate(date)}
            </div>
            {msgs.map((m) => (
              <Message message={m} key={m.id} />
            ))}
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

export default Messages;
