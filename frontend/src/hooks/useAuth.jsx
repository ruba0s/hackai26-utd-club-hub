import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL    = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AuthContext = createContext(null);

// Normalize whatever field the backend returns into a consistent shape.
// Backend may return onboardingComplete or quizCompleted — we always
// store quizCompleted locally so every component has one source of truth.
const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  return {
    ...rawUser,
    quizCompleted: rawUser.quizCompleted ?? rawUser.onboardingComplete ?? false,
  };
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevents onAuthStateChanged from firing a duplicate syncWithBackend
  // immediately after signUp/signIn already synced manually. Without this,
  // the listener briefly resets user to null + loading to true, causing
  // ProtectedRoute to redirect to /login mid-navigation.
  const skipNextAuthChange = useRef(false);

  const syncWithBackend = async (fbUser) => {
    const token = await fbUser.getIdToken();
    const res   = await fetch(`${API_URL}/api/auth/session`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(normalizeUser(data.user));
    return data;
  };

  const signUp = async (email, password, name = "") => {
    skipNextAuthChange.current = true;
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const token  = await result.user.getIdToken();
    const res    = await fetch(`${API_URL}/api/auth/session`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body:    JSON.stringify({ name }),
    });
    const data = await res.json();
    setUser(normalizeUser(data.user));
    setLoading(false);
    return data;
  };

  const signIn = async (email, password) => {
    skipNextAuthChange.current = true;
    const result = await signInWithEmailAndPassword(auth, email, password);
    const data   = await syncWithBackend(result.user);
    setLoading(false);
    return data;
  };

  // Optimistically flips quizCompleted locally so ProtectedRoute lets the
  // user through to /dashboard immediately, then persists to backend.
  const markOnboardingComplete = async (quizAnswers = {}) => {
    setUser(prev => prev ? { ...prev, quizCompleted: true } : prev);
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
      // Skip duplicate sync fired right after manual signUp/signIn
      if (skipNextAuthChange.current) {
        skipNextAuthChange.current = false;
        return;
      }
      if (fbUser) {
        try {
          await syncWithBackend(fbUser);
        } catch {
          setUser({ uid: fbUser.uid, email: fbUser.email, quizCompleted: false });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, getIdToken, markOnboardingComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}