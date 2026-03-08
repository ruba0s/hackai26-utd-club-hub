import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * requireQuiz={true}  (default) — user must be logged in AND have completed the quiz
 * requireQuiz={false}           — user must be logged in but must NOT have completed the quiz
 *                                 (used for /onboarding so finished users can't revisit it)
 */
export default function ProtectedRoute({ children, requireQuiz = true }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300" />
    </div>
  );

  // Not logged in — always send to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in, visiting /onboarding (requireQuiz=false):
  // if they already finished the quiz, skip straight to dashboard
  if (!requireQuiz && user.quizCompleted) return <Navigate to="/dashboard" replace />;

  // Logged in, visiting /dashboard (requireQuiz=true):
  // if they haven't finished the quiz yet, send them to onboarding
  if (requireQuiz && !user.quizCompleted) return <Navigate to="/onboarding" replace />;

  return children;
}