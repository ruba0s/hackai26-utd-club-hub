// backend/routes/events.js
import express from "express";
import { fetchEventsByDate, fetchEventsForRange } from "../services/nebula.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * GET /api/events/:date
 * Returns events from all three Nebula endpoints for a single date.
 * Date format: YYYY-MM-DD
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

/**
 * GET /api/events/range/:startDate?days=7
 * Returns events for a range of days starting from startDate.
 * Useful for populating the calendar view.
 */
router.get("/range/:startDate", verifyToken, async (req, res) => {
  const { startDate } = req.params;
  const days = parseInt(req.query.days) || 7;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  if (days < 1 || days > 30) {
    return res.status(400).json({ error: "Days must be between 1 and 30." });
  }

  try {
    const events = await fetchEventsForRange(startDate, days);
    return res.status(200).json({ startDate, days, events });
  } catch (err) {
    console.error("Events range error:", err);
    return res.status(500).json({ error: "Failed to fetch events range." });
  }
});

export default router;