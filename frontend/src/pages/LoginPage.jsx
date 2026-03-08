import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(user.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [user, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");
    setSubmitting(true);
    try {
      const data = await signIn(email, password);
      navigate(data.isNewUser || !data.user.onboardingComplete ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email": return "Invalid email address.";
      case "auth/user-not-found": return "No account found with this email.";
      case "auth/wrong-password": return "Incorrect password.";
      case "auth/invalid-credential": return "Incorrect email or password.";
      default: return "Something went wrong. Please try again.";
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to discover clubs & events</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="auth-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="auth-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={submitting} className="auth-btn">
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
