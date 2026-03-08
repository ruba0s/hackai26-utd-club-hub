import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function SignUpPage() {
  const { user, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!email || !password) return setError("Please fill in email and password.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      const data = await signUp(email, password, name.trim() || undefined);
      navigate(data.isNewUser || !data.user.onboardingComplete ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSubmitting(true);
    try {
      const data = await signInWithGoogle();
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
      case "auth/email-already-in-use": return "An account with this email already exists.";
      case "auth/weak-password": return "Password must be at least 6 characters.";
      case "auth/popup-closed-by-user": return "Sign-in was cancelled.";
      default: return "Something went wrong. Please try again.";
    }
  };

  if (loading) {
    return (
      <div className="signup-page">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div className="signup-page">
      <Link to="/login" className="clubhub-logo">
        <img src="/clubhub-logo.png" alt="ClubHub" className="clubhub-logo-img" />
      </Link>

      <div className="auth-card-signup">
        <h1 className="auth-title-signup">Sign up</h1>

        <form onSubmit={handleSubmit} className="auth-form-signup">
          <div>
            <label className="auth-label-signup">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input-signup"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="auth-label-signup">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input-signup"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="auth-label-signup">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input-signup"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="auth-label-signup">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input-signup"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="auth-error-signup">{error}</p>}
          <button type="submit" disabled={submitting} className="auth-btn-get-started">
            Get Started
          </button>
        </form>

        <div className="auth-separator">
          <span className="auth-separator-line" />
          <span className="auth-separator-text">or</span>
          <span className="auth-separator-line" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          className="auth-btn-google"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Login with Google
        </button>

        <p className="auth-footer-signup">
          Have an account? <Link to="/login" className="auth-link-login">Login Here!</Link>
        </p>
      </div>
    </div>
  );
}
