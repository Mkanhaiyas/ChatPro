import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Store session locally
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("rememberMe", "true");
      }

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err) {
      setError("Google Sign-In failed. Try again.");
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Enter your email to reset your password:");
    if (!email) return;

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (err) {
      alert("Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-xl dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-center dark:text-white">
          Login to ChatPro
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-500 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition"
          >
            Sign in with Google
          </button>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
