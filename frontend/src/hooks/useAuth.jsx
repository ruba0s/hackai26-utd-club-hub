import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // ── POST /api/auth/session ───────────────────────────────────
  // Called after every Firebase sign-in so the backend can create/
  // update the user record and return the full profile incl. onboardingComplete.
  const syncWithBackend = async (fbUser) => {
    const token = await fbUser.getIdToken();
    const res   = await fetch(`${API_URL}/api/auth/session`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data.user);
    setIsNewUser(data.isNewUser);
    return data;
  };

  // ── signUp ───────────────────────────────────────────────────
  // Accepts optional `name` so SignupPage can pass it; the backend
  // receives the Firebase token and can decode the email from it.
  // If you want name persisted, add it to the POST body below.
  const signUp = async (email, password, name = "") => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Optionally forward name to backend
    const token = await result.user.getIdToken();
    const res   = await fetch(`${API_URL}/api/auth/session`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setUser(data.user);
    setIsNewUser(true);
    return data;
  };

  // ── signIn ───────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return syncWithBackend(result.user);
  };

  // ── markOnboardingComplete ───────────────────────────────────
  // Called by Quiz when the user finishes. Hits the backend so
  // onboardingComplete is persisted, then refreshes local user state.
  const markOnboardingComplete = async (quizAnswers = {}) => {
    if (!auth.currentUser) return;
    const token = await auth.currentUser.getIdToken();
    const res   = await fetch(`${API_URL}/api/quiz/complete`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify(quizAnswers),
    });
    const data = await res.json();
    // Backend should return the updated user object
    setUser(data.user ?? { ...user, onboardingComplete: true });
  };

  // ── logout ───────────────────────────────────────────────────
  const logout = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      await fetch(`${API_URL}/api/auth/session`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await signOut(auth);
    setUser(null);
  };

  const getIdToken = () => auth.currentUser?.getIdToken();

  // ── listen to Firebase auth state ───────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) await syncWithBackend(fbUser);
      else setUser(null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isNewUser, signUp, signIn, logout, getIdToken, markOnboardingComplete }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}