// backend/services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Given a student's quiz answers and the full club list from Nebula,
 * returns a ranked list of recommended clubs with reasoning.
 */
export const generateClubRecommendations = async (quizAnswers, clubs) => {
  // Strip heavy fields before sending to Gemini to save tokens
  const trimmedClubs = clubs.map(({ id, name, description, tags, slug }) => ({
    id, name, tags, slug,
    description: description?.slice(0, 300),
  }));

  const prompt = `
You are a club recommendation engine for UT Dallas students.

Here is the student's profile from their onboarding quiz:
${JSON.stringify(quizAnswers, null, 2)}

Here is the full list of UTD clubs with their tags and descriptions:
${JSON.stringify(trimmedClubs, null, 2)}

Your task:
- Recommend the 8 most relevant clubs for this student
- Rank them from most to least relevant
- For each club, write 1-2 sentences explaining WHY it matches this specific student's profile
- Be specific — reference their major, interests, and goals in your reasoning

Respond ONLY with a JSON array, no markdown, no explanation outside the array. Format:
[
  {
    "id": "club id",
    "slug": "club slug",
    "name": "club name",
    "reason": "personalized explanation referencing the student's profile"
  }
]
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Gemini returned invalid JSON");
  }
};