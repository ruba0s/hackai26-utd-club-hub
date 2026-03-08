// backend/routes/clubs.js
import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";
import { fetchAllClubs, fetchClubById, fetchMonthEvents } from "../services/nebula.js";

const router = express.Router();

// GET /api/clubs/search?q=
router.get("/search", verifyToken, async (req, res) => {
  const q = req.query.q || "a";
  try {
    const clubs = await fetchAllClubs(q);
    return res.status(200).json({ clubs });
  } catch (err) {
    console.error("Club search error:", err);
    return res.status(500).json({ error: "Failed to search clubs." });
  }
});

/**
 * POST /api/clubs/:id/follow
 * Adds a club to the user's followed clubs in Firestore.
 */
router.post("/:id/follow", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { clubName } = req.body;

  if (!clubName) {
    return res.status(400).json({ error: "clubName is required." });
  }

  try {
    await db.collection("userClubs").doc(`${req.user.uid}_${id}`).set({
      userId: req.user.uid,
      clubId: id,
      clubName,
      followedAt: new Date().toISOString(),
    });

    return res.status(200).json({ message: "Club followed." });
  } catch (err) {
    console.error("POST /clubs/:id/follow error:", err);
    return res.status(500).json({ error: "Failed to follow club." });
  }
});

/**
 * DELETE /api/clubs/:id/follow
 * Removes a club from the user's followed clubs.
 */
router.delete("/:id/follow", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection("userClubs").doc(`${req.user.uid}_${id}`).delete();
    return res.status(200).json({ message: "Club unfollowed." });
  } catch (err) {
    console.error("DELETE /clubs/:id/follow error:", err);
    return res.status(500).json({ error: "Failed to unfollow club." });
  }
});

/**
 * GET /api/clubs/followed
 * Returns all clubs the current user is following.
 */
router.get("/followed", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection("userClubs")
      .where("userId", "==", req.user.uid)
      .get();

    const clubs = snap.docs.map(doc => doc.data());
    return res.status(200).json({ clubs });
  } catch (err) {
    console.error("GET /clubs/followed error:", err);
    return res.status(500).json({ error: "Failed to fetch followed clubs." });
  }
});

export default router;