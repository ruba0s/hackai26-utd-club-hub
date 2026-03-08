import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, loading]);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    setSubmitting(true);
    try {
      const action = isSignUp ? signUp : signIn;
      const data = await action(email, password);
      navigate(data.isNewUser || !data.user.onboardingComplete ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email":          return "Invalid email address.";
      case "auth/user-not-found":         return "No account found with this email.";
      case "auth/wrong-password":         return "Incorrect password.";
      case "auth/email-already-in-use":   return "An account with this email already exists.";
      case "auth/weak-password":          return "Password must be at least 6 characters.";
      case "auth/invalid-credential":     return "Incorrect email or password.";
      default:                            return "Something went wrong. Please try again.";
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 space-y-6">

        <div className="text-center space-y-1">
          <div className="text-4xl">🌟</div>
          <h1 className="text-2xl font-bold text-gray-900">UTD Club Hub</h1>
          <p className="text-sm text-gray-500">Discover clubs & events made for you</p>
        </div>

        <div className="border-t border-gray-100" />

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="text-orange-500 hover:underline font-medium"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="text-center text-xs text-gray-400">For UT Dallas students only</p>
      </div>
    </div>
  );
}