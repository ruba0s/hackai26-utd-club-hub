import express from "express";
import { db, auth } from "../config/firebase.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/session", verifyToken, async (req, res) => {
  const { uid, email, name, picture } = req.user;
  try {
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      const newUser = {
        uid, email,
        displayName: name || "",
        photoURL: picture || "",
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
      };
      await userRef.set(newUser);
      return res.status(201).json({ user: newUser, isNewUser: true });
    }

    return res.status(200).json({ user: userSnap.data(), isNewUser: false });
  } catch (err) {
    return res.status(500).json({ error: "Failed to establish session." });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const snap = await db.collection("users").doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: "User not found." });
    return res.status(200).json({ user: snap.data() });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch user." });
  }
});

router.delete("/session", verifyToken, async (req, res) => {
  try {
    await auth.revokeRefreshTokens(req.user.uid);
    return res.status(200).json({ message: "Session revoked." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to revoke session." });
  }
});

export default router;