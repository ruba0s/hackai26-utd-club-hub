## Club Hub – AI‑Powered Club & Event Marker for UTD

UTD has over 300 student organizations, but most students never find the ones that actually fit them. We were tired of scrolling through outdated flyers, hopping between Discords to find event dates, and manually cross‑checking meeting times with our schedules. There had to be a smarter way. Club Hub was born from that frustration: a platform that does the work for you and marks your calendar with what actually matters.

Club Hub is a full‑stack web app that uses UT Dallas Nebula APIs, Firebase, and Google’s Gemini to recommend clubs and events tailored to each student’s interests, major, and availability, then surfaces them in a clean, interactive calendar.

---

## Overview

**Club Hub** is a personalized discovery and scheduling tool for UTD students:

- **You tell it who you are** (major, year, interests, event preferences).
- **It pulls real club & event data** from official/centralized sources (Nebula APIs).
- **Gemini builds a ranked list of clubs** and events that actually match you.
- **You get a living calendar view** of what’s happening on campus that you might actually care about.

The goal is simple: **never miss another event that matters to you**.

---

## Features

- **Beautiful landing & auth experience**
  - Modern, UTD‑themed landing page.
  - Email/password signup and login via Firebase Authentication.
  - Protected routes for the dashboard and onboarding.

- **Onboarding quiz (6 questions)**
  - Major, year, interests, favored club types, event types, newsletter opt‑in.
  - UX optimized for quick completion (chips, inline suggestions, keyboard friendly).
  - Only runs once per user but answers are stored for introspection.

- **AI‑powered club recommendations**
  - Uses **UTD Nebula club data** and **Gemini** to rank ~8 best‑fit clubs.
  - Stores recommendations and quiz answers in Firestore.
  - Exposes recommendations via an authenticated API for the dashboard.

- **Personalized calendar**
  - Monthly calendar view inspired by modern productivity tools.
  - Events aggregated from Nebula sources (Mazevo, Events, Astra).
  - Filters to:
    - AI‑recommended clubs (“AI Picks”)
    - Clubs the user explicitly follows
  - Per‑day breakdown with event chips, times, and locations.

- **Followed clubs**
  - Follow/unfollow clubs from recommendations or search.
  - Separate `userClubs` collection in Firestore.
  - Followed clubs impact which events appear in the calendar.

- **Newsletter hooks**
  - Per‑user `newsletterOptIn` flag stored in Firestore.
  - Simple subscribe/unsubscribe flows exposed as APIs.

---

## Architecture

### Frontend

- **Framework**: React 19 with Vite  
- **Routing**: `react-router-dom`  
- **Auth**: Firebase Authentication (client SDK) + custom backend session sync  
- **Styling**: Hand‑crafted inline styles with design tokens (no CSS frameworks)  
- **Key pages/components**:
  - `LandingPage.jsx` – marketing page, CTAs to login/signup.
  - `SignupPage.jsx` / `LoginPage.jsx` – email/password auth, Firebase‑backed.
  - `Quiz.jsx` – the multi‑step onboarding quiz with AI copy + design.
  - `Dashboard.jsx` – main calendar & “My Clubs” view.
  - `ProtectedRoute.jsx` – guards routes behind auth & onboarding completion.
  - `useAuth.jsx` – global auth context and backend sync.

### Backend

- **Runtime**: Node.js (ES modules)  
- **Framework**: Express 5  
- **Auth**: Firebase Admin SDK + custom `verifyToken` middleware  
- **Database**: Firestore (via Firebase Admin)  
- **AI**: `@google/generative-ai` (Gemini 2.5 Flash)  
- **Event/club data**: UTD Nebula REST APIs  
- **Key responsibilities**:
  - Validating Firebase ID tokens and mapping them to `users` in Firestore.
  - Managing quiz submissions and AI recommendations.
  - Aggregating events and shaping them for the calendar UI.
  - Managing followed clubs and newsletter preferences.

### External Services

- **Firebase**
  - Authentication (client SDK in frontend).
  - Firestore (via Admin SDK in backend).
- **Google Gemini**
  - Used to select and explain the top clubs for a user.
- **UTD Nebula API**
  - `https://api.utdnebula.com`
  - Provides club and event data (including Mazevo/Astra events).

---

## Project Structure

High‑level layout:

```text
hackai26-utd-club-hub/
  backend/
    server.js              # Express app entrypoint
    config/firebase.js     # Firebase Admin initialization
    routes/
      auth.js              # Session bootstrap, /me, revoke
      users.js             # User profile read/update
      quiz.js              # Submit + fetch quiz answers
      recommendations.js   # AI recommendations endpoints
      clubs.js             # Club search + follow/unfollow + followed list
      events.js            # Calendar + day events
      newsletter.js        # Subscribe/unsubscribe newsletter
    services/
      gemini.js            # Gemini-based club ranking
      nebula.js            # Nebula club/event fetch helpers
    middleware/
      verifyToken.js       # Validates Firebase ID tokens
    package.json

  frontend/
    src/
      App.jsx
      pages/
        LandingPage.jsx
        SignupPage.jsx
        LoginPage.jsx
        Dashboard.jsx
        Quiz.jsx
      hooks/
        useAuth.jsx
      config/
        firebase.js
      components/
        auth/ProtectedRoute.jsx
    package.json
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (v20+ recommended)  
- **npm**: v9+ (bundled with modern Node)  
- A **Firebase project** with:
  - Web app credentials for the frontend.
  - A service account for the backend (Admin SDK).
- A **Nebula API key** and a **Gemini API key**.

---

### Environment Variables

You’ll need **two** environment files: one for the backend and one for the frontend.

#### Backend – `backend/.env`

```env
# Server
PORT=3001
CLIENT_URL=http://localhost:5173

# Firebase Admin
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-firebase-project-id.iam.gserviceaccount.com

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# Nebula
NEBULA_API_KEY=your_nebula_api_key
```
Notes:

- `FIREBASE_PRIVATE_KEY` must be **escaped** for `.env` (newlines as `\n`), which is why `firebase.js` calls `.replace(/\\n/g, "\n")`.
- `CLIENT_URL` must match your frontend origin for CORS.

#### Frontend – `frontend/.env`

```env
# Backend base URL
VITE_API_URL=http://localhost:3001

# Firebase client config
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
```
---

### Installation

From the repo root:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```
---

### Running Locally

In two terminals:

```bash
# Terminal 1 – backend
cd backend
npm run dev          # nodemon server.js, defaults to http://localhost:3001

# Terminal 2 – frontend
cd frontend
npm run dev          # Vite dev server, usually http://localhost:5173
```

Then open `http://localhost:5173` in your browser.

**Frontend scripts:**

- `npm run dev` – Vite dev server with HMR.
- `npm run build` – production build.
- `npm run preview` – preview built frontend.

**Backend scripts:**

- `npm run dev` – dev server with nodemon.
- `npm start` – plain `node server.js`.

## Acknowledgements

- **UT Dallas Nebula** – for centralized club and event data.
- **Firebase** – auth and serverless datastore.
- **Google Gemini** – powering the club recommendation engine.
- All UTD student orgs whose events and communities make this project worth building.
