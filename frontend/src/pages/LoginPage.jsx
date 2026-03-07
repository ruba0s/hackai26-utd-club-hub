import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, loading]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError("");
    try {
      const data = await signInWithGoogle();
      navigate(data.isNewUser || !data.user.onboardingComplete ? "/onboarding" : "/dashboard");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl">🌟</div>
          <h1 className="text-2xl font-bold text-gray-900">UTD Club Hub</h1>
          <p className="text-sm text-gray-500">Discover clubs & events made for you</p>
        </div>
        <div className="border-t border-gray-100" />
        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          {signingIn ? "Signing in..." : "Continue with Google"}
        </button>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <p className="text-center text-xs text-gray-400">For UT Dallas students only</p>
      </div>
    </div>
  );
}