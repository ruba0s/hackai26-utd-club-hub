// backend/routes/recommendations.js
import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAllClubs } from "../services/nebula.js";
import { generateClubRecommendations } from "../services/gemini.js";

const router = express.Router();

/**
 * POST /api/recommendations
 * Called once on quiz submit.
 * Fetches all clubs, sends to Gemini with quiz answers,
 * saves recommendations to Firestore, marks onboarding complete.
 */
router.post("/", verifyToken, async (req, res) => {
  const { quizAnswers } = req.body;

  if (!quizAnswers) {
    return res.status(400).json({ error: "Missing quizAnswers in request body." });
  }

  try {
    // 1. Fetch all clubs from Nebula
    const clubs = await fetchAllClubs();

    // 2. Generate recommendations via Gemini
    const recommendations = await generateClubRecommendations(quizAnswers, clubs);

    // 3. Save to Firestore and mark onboarding complete
    const userRef = db.collection("users").doc(req.user.uid);
    await userRef.update({
      quizAnswers,
      recommendations,
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ recommendations });
  } catch (err) {
    console.error("Recommendations error:", err);
    return res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

/**
 * GET /api/recommendations
 * Returns saved recommendations from Firestore.
 * No need to re-call Gemini on every dashboard load.
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userSnap = await db.collection("users").doc(req.user.uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found." });
    }

    const { recommendations, quizAnswers } = userSnap.data();

    if (!recommendations) {
      return res.status(404).json({ error: "No recommendations found. Complete the quiz first." });
    }

    return res.status(200).json({ recommendations, quizAnswers });
  } catch (err) {
    console.error("Get recommendations error:", err);
    return res.status(500).json({ error: "Failed to fetch recommendations." });
  }
});

export default router;