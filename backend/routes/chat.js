import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchAllClubs, fetchEventsByDate } from "../services/nebula.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    // Fetch live UTD data to give Gemini context
    const today = new Date().toISOString().split("T")[0];
    const [clubs, events] = await Promise.allSettled([
      fetchAllClubs("a"),
      fetchEventsByDate(today),
    ]);

    const clubList = clubs.status === "fulfilled"
      ? clubs.value.map(c => ({ name: c.name, description: c.description?.slice(0, 150), tags: c.tags }))
      : [];

    const prompt = `
You are a helpful UTD campus assistant called Club Hub. 
You help UT Dallas students find clubs, events, and campus resources.

Today's date: ${today}

Available UTD clubs:
${JSON.stringify(clubList.slice(0, 50), null, 2)}

Today's campus events:
${JSON.stringify(events.status === "fulfilled" ? events.value : {}, null, 2)}

Student's question: "${message}"

Answer helpfully and concisely. If recommending clubs, mention 2-3 max with a short reason.
If you don't know something, say so honestly.
    `;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;