// backend/routes/newsletter.js
import express from "express";
import { db } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * POST /api/newsletter/subscribe
 */
router.post("/subscribe", verifyToken, async (req, res) => {
  try {
    await db.collection("users").doc(req.user.uid).update({
      newsletterOptIn: true,
      updatedAt: new Date().toISOString(),
    });
    return res.status(200).json({ message: "Subscribed to newsletter." });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: "Failed to subscribe." });
  }
});

/**
 * POST /api/newsletter/unsubscribe
 */
router.post("/unsubscribe", verifyToken, async (req, res) => {
  try {
    await db.collection("users").doc(req.user.uid).update({
      newsletterOptIn: false,
      updatedAt: new Date().toISOString(),
    });
    return res.status(200).json({ message: "Unsubscribed from newsletter." });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return res.status(500).json({ error: "Failed to unsubscribe." });
  }
});

export default router;