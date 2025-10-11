import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { authService as auth } from "./firebase";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser, logout: () => signOut(auth) };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
