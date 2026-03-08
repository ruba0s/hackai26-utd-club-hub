// backend/routes/quiz.js
import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAllClubs } from "../services/nebula.js";
import { generateClubRecommendations } from "../services/gemini.js";

const router = express.Router();

/**
 * POST /api/quiz/submit
 * Saves quiz answers, triggers Gemini recommendations,
 * marks onboarding complete.
 */
router.post("/submit", verifyToken, async (req, res) => {
  const { major, year, interests, currentClubs, eventTypes, newsletterOptIn } = req.body;

  if (!major || !year || !interests) {
    return res.status(400).json({ error: "Missing required quiz fields." });
  }

  const quizAnswers = { major, year, interests, currentClubs, eventTypes, newsletterOptIn };

  try {
    // 1. Save quiz results to quizResults collection
    await db.collection("quizResults").doc(req.user.uid).set({
      userId: req.user.uid,
      ...quizAnswers,
      submittedAt: new Date().toISOString(),
    });

    // 2. Generate recommendations via Gemini
    const clubs = await fetchAllClubs();
    const recommendations = await generateClubRecommendations(quizAnswers, clubs);

    // 3. Update user profile + save recommendations + mark onboarding complete
    await db.collection("users").doc(req.user.uid).update({
      major,
      year,
      interests,
      newsletterOptIn: newsletterOptIn || false,
      onboardingComplete: true,
      recommendations,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ recommendations });
  } catch (err) {
    console.error("POST /quiz/submit error:", err);
    return res.status(500).json({ error: "Failed to submit quiz." });
  }
});

/**
 * GET /api/quiz/:userId
 * Returns saved quiz answers for a user.
 */
router.get("/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (req.user.uid !== userId) {
    return res.status(403).json({ error: "Forbidden." });
  }

  try {
    const snap = await db.collection("quizResults").doc(userId).get();
    if (!snap.exists) return res.status(404).json({ error: "Quiz answers not found." });
    return res.status(200).json({ quiz: snap.data() });
  } catch (err) {
    console.error("GET /quiz/:userId error:", err);
    return res.status(500).json({ error: "Failed to fetch quiz answers." });
  }
});

export default router;