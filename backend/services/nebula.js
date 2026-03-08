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

export const fetchAllClubs = async (query = "a") => {
  return nebulaFetch(`/club/search?q=${encodeURIComponent(query)}`);
};

export const fetchClubById = async (id) => {
  return nebulaFetch(`/club/${id}`);
};

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

/**
 * Flattens the nested building → room → events structure from Mazevo
 * into a clean list of events the frontend can use directly.
 * Filters to only events from clubs in the provided clubNames list.
 */
export const flattenAndFilterMazevoEvents = (mazevoData, clubNames) => {
  if (!mazevoData?.buildings) return [];

  const normalizedNames = clubNames.map(n => n.toLowerCase().trim());
  const events = [];

  for (const building of mazevoData.buildings) {
    for (const room of building.rooms) {
      for (const event of room.events) {
        const orgName = event.organizationName?.toLowerCase().trim() || "";

        // Include if organizationName fuzzy-matches any club the user cares about
        const isMatch = normalizedNames.some(
          name => orgName.includes(name) || name.includes(orgName)
        );

        if (isMatch) {
          events.push({
            eventName:        event.eventName,
            organizationName: event.organizationName,
            date:             mazevoData.date,
            startTime:        event.dateTimeStart,
            endTime:          event.dateTimeEnd,
            building:         building.building,
            room:             room.room,
            location:         `${building.building} ${room.room}`,
            statusDescription: event.statusDescription,
          });
        }
      }
    }
  }

  return events;
};

/**
 * Fetches all Mazevo events for every day in a given month,
 * filtered to only the provided club names.
 * Returns a flat array sorted by date/time.
 */
export const fetchMonthEvents = async (year, month, clubNames) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, "0");
    const m   = String(month).padStart(2, "0");
    return `${year}-${m}-${day}`;
  });

  const results = await Promise.allSettled(
    dates.map(date => nebulaFetch(`/mazevo/${date}`))
  );

  const allEvents = [];
  results.forEach(result => {
    if (result.status === "fulfilled") {
      const filtered = flattenAndFilterMazevoEvents(result.value, clubNames);
      allEvents.push(...filtered);
    }
  });

  return allEvents.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
};

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