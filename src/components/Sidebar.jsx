import React from "react";
import Navbar from "./Navbar.jsx";
import Search from "./Search.jsx";
import Chats from "./Chats.jsx";

const Sidebar = ({ onToggle }) => {
  return (
    <div className="w-full h-full bg-white flex flex-col dark:bg-[#2d2e3e]">
      <div className="flex-1 overflow-y-auto">
        <Navbar />
        <Search />
        <Chats onToggle={onToggle} />
      </div>
    </div>
  );
};

export default Sidebar;
