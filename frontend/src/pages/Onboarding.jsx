import Quiz from "./Quiz";

/**
 * OnboardingPage
 *
 * Protected route: requires auth but NOT completed onboarding
 * (requireOnboarding={false} in App.jsx).
 *
 * Renders the full-screen Quiz flow. Quiz internally calls
 * navigate("/dashboard") when the user finishes.
 */
export default function Onboarding() {
  return <Quiz />;
}