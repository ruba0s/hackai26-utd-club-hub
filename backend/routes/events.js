// backend/routes/events.js
import express from "express";
import { db } from "../config/firebase.js";
import { fetchEventsByDate, fetchEventsForRange, fetchMonthEvents } from "../services/nebula.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * GET /api/events/calendar/:year/:month
 * Returns all events for the month filtered to the user's
 * recommended + followed clubs, formatted for the calendar.
 *
 * Each event: { eventName, organizationName, date, startTime,
 *               endTime, building, room, location }
 */
router.get("/calendar/:year/:month", verifyToken, async (req, res) => {
  const year  = parseInt(req.params.year);
  const month = parseInt(req.params.month);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: "Invalid year or month." });
  }

  try {
    // 1. Get user's recommended club names
    const userSnap = await db.collection("users").doc(req.user.uid).get();
    if (!userSnap.exists) return res.status(404).json({ error: "User not found." });

    const { recommendations } = userSnap.data();
    const recommendedNames = (recommendations || []).map(r => r.name);

    // 2. Get user's followed club names
    const followedSnap = await db.collection("userClubs")
      .where("userId", "==", req.user.uid)
      .get();
    const followedNames = followedSnap.docs.map(doc => doc.data().clubName);

    // 3. Merge and deduplicate club names
    const allClubNames = [...new Set([...recommendedNames, ...followedNames])];

    if (allClubNames.length === 0) {
      return res.status(200).json({ year, month, events: [] });
    }

    // 4. Fetch and filter events for the month
    const events = await fetchMonthEvents(year, month, allClubNames);

    return res.status(200).json({ year, month, total: events.length, events });
  } catch (err) {
    console.error("Calendar events error:", err);
    return res.status(500).json({ error: "Failed to fetch calendar events." });
  }
});

/**
 * GET /api/events/:date
 * Single day events (raw, all sources).
 */
router.get("/:date", verifyToken, async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }
  try {
    const events = await fetchEventsByDate(date);
    return res.status(200).json({ date, events });
  } catch (err) {
    console.error("Events error:", err);
    return res.status(500).json({ error: "Failed to fetch events." });
  }
});

export default router;