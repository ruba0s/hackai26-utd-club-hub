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
  const { major, year, interests, clubs, eventTypes, newsletterOptIn } = req.body;

  if (!major || !year || !interests?.length) {
    return res.status(400).json({ error: "Missing required quiz fields." });
  }

  const quizAnswers = { major, year, interests, clubs: clubs || [], eventTypes: eventTypes || [], newsletterOptIn: newsletterOptIn || false };

  try {
    // 1. Save to quizResults collection
    await db.collection("quizResults").doc(req.user.uid).set({
      userId: req.user.uid,
      major, year, interests,
      clubs: clubs || [],
      eventTypes: eventTypes || [],
      newsletterOptIn: newsletterOptIn || false,
      submittedAt: new Date().toISOString(),
    });

    // 2. Generate Gemini recommendations
    const allClubs = await fetchAllClubs();
    const recommendations = await generateClubRecommendations(quizAnswers, allClubs);

    // 3. Update user doc
    await db.collection("users").doc(req.user.uid).update({
      major, year, interests,
      newsletterOptIn: newsletterOptIn || false,
      quizCompleted: true,
      recommendations,
      updatedAt: new Date().toISOString(),
    });

    // 4. Auto-follow clubs selected during onboarding
    // First fetch full club data so we have IDs, not just names
    const batch = db.batch();
    for (const clubName of (clubs || [])) {
      // Search Nebula for this club to get its ID
      const results = await fetchAllClubs(clubName);
      const match = results?.find(c =>
        c.name?.toLowerCase().trim() === clubName.toLowerCase().trim()
      );
      if (match) {
        const docRef = db.collection("userClubs").doc(`${req.user.uid}_${match.id}`);
        batch.set(docRef, {
          userId:    req.user.uid,
          clubId:    match.id,
          clubName:  match.name,
          slug:      match.slug,
          followedAt: new Date().toISOString(),
        });
      }
    }
    await batch.commit();

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
  if (req.user.uid !== req.params.userId) {
    return res.status(403).json({ error: "Forbidden." });
  }
  try {
    const snap = await db.collection("quizResults").doc(req.params.userId).get();
    if (!snap.exists) return res.status(404).json({ error: "Quiz answers not found." });
    return res.status(200).json({ quiz: snap.data() });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch quiz answers." });
  }
});

export default router;