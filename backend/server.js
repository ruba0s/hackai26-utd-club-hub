import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import quizRoutes from "./routes/quiz.js";
import clubRoutes from "./routes/clubs.js";
import eventRoutes from "./routes/events.js";
import recommendationRoutes from "./routes/recommendations.js";
import newsletterRoutes from "./routes/newsletter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));