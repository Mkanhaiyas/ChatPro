import React, { useContext, useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import { Search as SearchIcon } from "lucide-react";

const Search = () => {
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!username.trim()) {
        setUsers([]);
        return;
      }

      const q = query(
        collection(db, "users"),
        where("displayName", ">=", username),
        where("displayName", "<=", username + "\uf8ff")
      );

      try {
        const querySnapshot = await getDocs(q);
        const results = [];

        querySnapshot.forEach((doc) => {
          if (doc.data().uid !== currentUser.uid) {
            results.push(doc.data());
          }
        });

        setUsers(results);
        setErr(results.length === 0);
      } catch (error) {
        console.error("Error fetching users:", error);
        setErr(true);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleSelect = async (user) => {
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + "_" + user.uid
        : user.uid + "_" + currentUser.uid;

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
    }

    setUsername("");
    setUsers([]);
  };

  return (
    <div className="w-full px-4 py-3 border-b border-light-border dark:border-dark-border">
      <div className="flex items-center gap-2 bg-light-muted dark:bg-[#1E1F2B] px-4 py-3 rounded-lg">
        <input
          type="text"
          placeholder="Search name..."
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          onKeyDown={(e) => {
            if (e.key === "Enter" && users.length > 0) {
              handleSelect(users[0]);
            }
          }}
          className="bg-transparent outline-none text-sm w-full text-light-text dark:text-dark-text dark:placeholder:text-dark-placeholder"
        />
        <SearchIcon className="w-4 h-4 text-light-icon dark:text-[#A3A4B5]" />
      </div>

      {err && <p className="text-red-500 text-sm mt-2 ml-1">No users found!</p>}

      {users.map((user) => (
        <div
          key={user.uid}
          onClick={() => handleSelect(user)}
          className="flex items-center gap-4 p-2 mt-2 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer transition"
        >
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-sm text-light-text dark:text-dark-text">
              {user.displayName}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Search;
