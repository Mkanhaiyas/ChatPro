import React from "react";
import { Send } from "lucide-react";

const SendButton = ({ onSend }) => {
  return (
    <button
      onClick={onSend}
      className="group hover:bg-blue-700 dark:hover:bg-blue-600 text-white p-2 rounded-full transition duration-300"
    >
      <Send
        size={20}
        className="text-[#4B3DFF] dark:text-white group-hover:text-white"
      />
    </button>
  );
};

export default SendButton;
