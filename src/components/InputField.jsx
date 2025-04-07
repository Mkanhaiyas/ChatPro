import React from "react";
import { Paperclip } from "lucide-react";

const InputField = ({ text, setText, setImg }) => {
  return (
    <div className="flex items-center gap-2 flex-1">
      <label className="cursor-pointer relative flex items-center lg:pl-2">
        <input
          type="file"
          style={{ display: "none" }}
          onChange={(e) => setImg(e.target.files[0])}
        />
        <Paperclip
          className="text-gray-500 dark:text-gray-300 hover:text-blue-400 dark:hover:text-blue-500 transition duration-200 hover:scale-125"
          size={18}
        />
      </label>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 rounded-lg lg:px-4 lg:py-2 bg-transparent focus:outline-none"
      />
    </div>
  );
};

export default InputField;
