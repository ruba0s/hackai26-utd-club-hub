// backend/routes/users.js
import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * GET /api/users/:id
 * Returns a user's full profile from Firestore.
 */
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  // Users can only access their own profile
  if (req.user.uid !== id) {
    return res.status(403).json({ error: "Forbidden." });
  }

  try {
    const snap = await db.collection("users").doc(id).get();
    if (!snap.exists) return res.status(404).json({ error: "User not found." });
    return res.status(200).json({ user: snap.data() });
  } catch (err) {
    console.error("GET /users/:id error:", err);
    return res.status(500).json({ error: "Failed to fetch user." });
  }
});

/**
 * PUT /api/users/:id
 * Updates allowed profile fields.
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.uid !== id) {
    return res.status(403).json({ error: "Forbidden." });
  }

  // Whitelist updatable fields — never let clients update uid, email, onboardingComplete directly
  const { displayName, major, year, interests, newsletterOptIn } = req.body;

  const updates = {};
  if (displayName  !== undefined) updates.displayName  = displayName;
  if (major        !== undefined) updates.major        = major;
  if (year         !== undefined) updates.year         = year;
  if (interests    !== undefined) updates.interests    = interests;
  if (newsletterOptIn !== undefined) updates.newsletterOptIn = newsletterOptIn;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No valid fields to update." });
  }

  updates.updatedAt = new Date().toISOString();

  try {
    await db.collection("users").doc(id).update(updates);
    const snap = await db.collection("users").doc(id).get();
    return res.status(200).json({ user: snap.data() });
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    return res.status(500).json({ error: "Failed to update user." });
  }
});

export default router;