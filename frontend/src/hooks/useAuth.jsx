import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL    = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const syncWithBackend = async (fbUser) => {
    const token = await fbUser.getIdToken();
    const res   = await fetch(`${API_URL}/api/auth/session`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data.user);
    setIsNewUser(data.isNewUser ?? false);
    return data;
  };

  const signUp = async (email, password, name = "") => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const token  = await result.user.getIdToken();
    const res    = await fetch(`${API_URL}/api/auth/session`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ name }),
    });
    const data = await res.json();
    setUser(data.user);
    setIsNewUser(true);
    return data;
  };

  const signIn = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return syncWithBackend(result.user);
  };

  // Optimistically flips onboardingComplete locally so ProtectedRoute
  // lets the user through immediately, then persists to backend.
  const markOnboardingComplete = async (quizAnswers = {}) => {
    setUser(prev => prev ? { ...prev, onboardingComplete: true } : prev);
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${API_URL}/api/quiz/complete`, {
          method:  "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body:    JSON.stringify(quizAnswers),
        });
      } catch (err) {
        console.warn("Failed to persist quiz to backend:", err);
      }
    }
  };

  const logout = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch(`${API_URL}/api/auth/session`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
    }
    await signOut(auth);
    setUser(null);
  };

  const getIdToken = () => auth.currentUser?.getIdToken();

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          await syncWithBackend(fbUser);
        } catch {
          setUser({ uid: fbUser.uid, email: fbUser.email, onboardingComplete: false });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser, signUp, signIn, logout, getIdToken, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}