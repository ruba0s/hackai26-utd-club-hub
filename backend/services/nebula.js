// backend/services/nebula.js
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://api.utdnebula.com";
const API_KEY = process.env.NEBULA_API_KEY;

const nebulaFetch = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!res.ok) throw new Error(`Nebula API error: ${res.status} on ${path}`);
  const json = await res.json();
  return json.data;
};

// Fetch all clubs — optionally filter by search term
// export const fetchAllClubs = async (query = "") => {
//   const path = query
//     ? `/club/search?q=${encodeURIComponent(query)}`
//     : `/club/search?q=`;
//   return nebulaFetch(path);
// };
export const fetchAllClubs = async (query = "a") => {
  const path = `/club/search?q=${encodeURIComponent(query)}`;
  return nebulaFetch(path);
};

// Fetch events from all three endpoints for a given date (YYYY-MM-DD)
export const fetchEventsByDate = async (date) => {
  const [astra, events, mazevo] = await Promise.allSettled([
    nebulaFetch(`/astra/${date}`),
    nebulaFetch(`/events/${date}`),
    nebulaFetch(`/mazevo/${date}`),
  ]);

  return {
    astra:  astra.status  === "fulfilled" ? astra.value  : null,
    events: events.status === "fulfilled" ? events.value : null,
    mazevo: mazevo.status === "fulfilled" ? mazevo.value : null,
  };
};

// Fetch events for a date range (e.g. next 7 days)
export const fetchEventsForRange = async (startDate, days = 7) => {
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const results = await Promise.allSettled(dates.map(fetchEventsByDate));

  return results.reduce((acc, result, i) => {
    if (result.status === "fulfilled") acc[dates[i]] = result.value;
    return acc;
  }, {});
};