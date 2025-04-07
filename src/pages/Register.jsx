import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase"; // Removed storage import
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import axios from "axios";

const Register = () => {
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const displayName = e.target.displayName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const file = e.target.avatar.files[0];

    if (!file) return setErr("Please select an avatar image.");

    setLoading(true);
    setErr("");

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat-pro"); // 🔁 Replace with your actual preset
      formData.append("folder", "ChatPro");

      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dtgdvbpxk/image/upload", // 🔁 Replace with your Cloudinary cloud name
        formData
      );

      const downloadURL = uploadRes.data.secure_url;

      await updateProfile(res.user, {
        displayName,
        photoURL: downloadURL,
      });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        displayName,
        email,
        photoURL: downloadURL,
        createdAt: serverTimestamp(),
        language: "en",
        theme: "light",
      });

      await setDoc(doc(db, "userChats", res.user.uid), {});
      navigate("/");
    } catch (err) {
      console.error(err);
      setErr("Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">Join ChatPro now</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="text"
            name="displayName"
            placeholder="Display Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
          <input
            required
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            <span className="text-sm">{fileName || "Upload avatar image"}</span>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFileName(e.target.files[0]?.name)}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>

          {err && (
            <p className="text-red-500 text-sm mt-2 text-center">{err}</p>
          )}
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
