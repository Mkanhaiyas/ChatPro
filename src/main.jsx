import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthContextProvider } from "./context/AuthContext"; // ✅ import this
import { ChatContextProvider } from "./context/ChatContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthContextProvider>
      <ChatContextProvider>
        <App />
      </ChatContextProvider>
    </AuthContextProvider>
  </StrictMode>
);
