import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { motion, AnimatePresence } from "framer-motion";
import useWindowWidth from "@/hooks/useWindowWidth";

const slideVariants = {
  initial: { x: "100%", opacity: 0 },
  enter: { x: 0, opacity: 1 },
  exit: { x: "-100%", opacity: 0 },
};

const Home = () => {
  const width = useWindowWidth();
  const isMobile = width <= 768;
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="w-full h-screen bg-light-background dark:bg-dark-background overflow-hidden relative transition-colors duration-300">
      <AnimatePresence mode="wait">
        {isMobile ? (
          showSidebar ? (
            <motion.div
              key="sidebar"
              variants={slideVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Sidebar onToggle={() => setShowSidebar(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              variants={slideVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <Chat onToggle={() => setShowSidebar(true)} />
            </motion.div>
          )
        ) : (
          <div className="flex w-full h-screen overflow-hidden">
            <div className="w-full md:w-[380px] border-r border-gray-300 dark:border-r-2 dark:border-[#7e819d]">
              <Sidebar />
            </div>
            <div className="flex-1 bg-light-muted dark:bg-dark-muted">
              <Chat />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
