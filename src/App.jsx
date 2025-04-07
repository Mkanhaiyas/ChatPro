import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthContext } from "./context/AuthContext";
import Loader from "./components/Loader";
import PageWrapper from "./components/PageWrapper";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Chat from "./components/Chat";
import Register from "./pages/Register";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";

const AppRoutes = ({ currentUser }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Toaster position="top-center" richColors />
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <PageWrapper>
                <Home />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PageWrapper>
              <Chat />
            </PageWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) return <Loader message="Checking authentication..." />;

  return (
    <BrowserRouter>
      <AppRoutes currentUser={currentUser} />
    </BrowserRouter>
  );
}

export default App;
