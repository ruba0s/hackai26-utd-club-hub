import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const syncWithBackend = async (fbUser) => {
    const token = await fbUser.getIdToken();
    const res = await fetch(`${API_URL}/api/auth/session`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data.user);
    setIsNewUser(data.isNewUser);
    return data;
  };

  const signUp = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return syncWithBackend(result.user);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    return syncWithBackend(result.user);
  };

  const signIn = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return syncWithBackend(result.user);
  };

  const logout = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch(`${API_URL}/api/auth/session`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await signOut(auth);
    setUser(null);
  };

  const getIdToken = () => auth.currentUser?.getIdToken();

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) await syncWithBackend(fbUser);
      else setUser(null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser, signUp, signIn, signInWithGoogle, logout, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
