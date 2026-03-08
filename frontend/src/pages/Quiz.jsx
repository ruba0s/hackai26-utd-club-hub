import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* ─── DESIGN TOKENS ──────────────────────────────────────────
   Font:   Courier New / monospace throughout
   BG:     #080808 near-black
   Glow:   warm olive-amber radial blobs (position varies per screen)
   Yellow: #FDFDA3  (active states, underline, CTA)
   Orange: #E8540A  (UTD italic on intro screen)
   Chips:  #1a1a1a bg, #2a2a2a border
   Input:  #141414 bg, yellow border when focused/filled
   Muted:  #5a5a5a
──────────────────────────────────────────────────────────────*/
const Y    = "#FDFDA3";
const OR   = "#E8540A";
const BG   = "#080808";
const C1   = "#1a1a1a";
const C2   = "#141414";
const BR   = "#2a2a2a";
const MU   = "#5a5a5a";
const TX   = "#e8e8e8";
const FONT = "'Courier New', Courier, monospace";

// ─── SHARED UI ───────────────────────────────────────────────

function Squiggle({ width = 160 }) {
  return (
    <svg
      width={width}
      height={10}
      viewBox={`0 0 ${width} 10`}
      fill="none"
      style={{ display: "block", marginTop: 2 }}
    >
      <path
        d={`M2 6 Q${width * 0.15} 2 ${width * 0.3} 6 Q${width * 0.45} 10 ${width * 0.6} 5 Q${width * 0.75} 2 ${width * 0.9} 6 Q${width * 0.95} 7 ${width - 2} 5`}
        stroke={Y}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Logo() {
  return (
    <div style={{ position: "fixed", top: 22, left: 28, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: "#fff" }}>
          ClubHub
        </span>
        <span style={{ fontSize: 16 }}>🖊️</span>
      </div>
      <Squiggle width={108} />
    </div>
  );
}

function Glow({ step }) {
  const configs = [
    [{ x: "38%", y: "62%", color: "rgba(110,90,15,0.6)",   r: 480 }, { x: "18%", y: "75%", color: "rgba(140,55,10,0.35)",  r: 320 }],
    [{ x: "22%", y: "68%", color: "rgba(140,60,10,0.55)",  r: 460 }, { x: "72%", y: "72%", color: "rgba(100,100,15,0.3)",  r: 360 }],
    [{ x: "55%", y: "50%", color: "rgba(100,105,20,0.45)", r: 420 }, { x: "20%", y: "80%", color: "rgba(130,50,10,0.25)",  r: 280 }],
    [{ x: "40%", y: "70%", color: "rgba(145,65,10,0.5)",   r: 440 }, { x: "75%", y: "55%", color: "rgba(90,95,18,0.25)",   r: 300 }],
    [{ x: "48%", y: "58%", color: "rgba(110,100,18,0.48)", r: 450 }, { x: "12%", y: "80%", color: "rgba(140,55,8,0.3)",    r: 320 }],
    [{ x: "35%", y: "65%", color: "rgba(140,60,10,0.50)",  r: 440 }, { x: "70%", y: "60%", color: "rgba(95,100,18,0.28)",  r: 320 }],
    [{ x: "50%", y: "55%", color: "rgba(115,95,16,0.45)",  r: 430 }, { x: "22%", y: "70%", color: "rgba(135,50,8,0.28)",   r: 300 }],
    [{ x: "42%", y: "60%", color: "rgba(108,100,18,0.45)", r: 420 }, { x: "68%", y: "72%", color: "rgba(130,55,10,0.28)",  r: 310 }],
    [{ x: "50%", y: "50%", color: "rgba(120,100,20,0.5)",  r: 500 }],
    [{ x: "50%", y: "55%", color: "rgba(112,100,18,0.48)", r: 480 }],
  ];
  const blobs = configs[Math.min(step, configs.length - 1)];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x, top: b.y,
            width: b.r, height: b.r,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: b.color,
            filter: "blur(100px)",
            transition: "all 0.9s ease",
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "#1e1e1e", zIndex: 200 }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: Y,
          transition: "width 0.45s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

function ContinueBtn({ onClick, disabled, label = "continue →" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "18px 0",
        borderRadius: 10,
        border: "none",
        background: disabled ? "rgba(180,170,60,0.22)" : Y,
        color: disabled ? "rgba(0,0,0,0.35)" : "#111",
        fontFamily: FONT,
        fontSize: "1rem",
        fontWeight: 600,
        letterSpacing: "0.3px",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      {label}
    </button>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────

function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: FONT, fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
          Welcome to UTD<br />
          <span style={{ position: "relative", display: "inline-block" }}>
            ClubHub <span style={{ fontSize: "1.8rem" }}>🖊️</span>
          </span>
        </h1>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <Squiggle width={180} />
        </div>
      </div>
      <p style={{ fontFamily: FONT, fontSize: "1.1rem", color: TX, letterSpacing: "0.2px", lineHeight: 1.7 }}>
        it's time to{" "}
        <span style={{ border: `1.5px solid ${Y}`, borderRadius: 5, padding: "2px 10px", color: Y }}>remark</span>
        {" "}your<br />calendar.
      </p>
    </div>
  );
}

function Intro({ onNext }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: 24, padding: "0 24px" }}>
      <div style={{ border: `1px solid ${BR}`, borderRadius: 6, padding: "7px 20px", fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "1.8px" }}>
        remark your calendar
      </div>
      <h1 style={{ fontFamily: FONT, fontSize: "clamp(2.4rem,5.5vw,4.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-2px", maxWidth: 820 }}>
        Let's personalize your<br />
        <span style={{ color: OR, fontStyle: "italic" }}>UTD</span><br />
        experience
      </h1>
      <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: MU, maxWidth: 520, lineHeight: 1.75, letterSpacing: "0.2px" }}>
        Answer 6 quick questions and we'll match<br />
        you with the events that will matter to you<br />
        the most using our advanced AI-<br />
        recommendation system.
      </p>
      <button
        onClick={onNext}
        style={{
          marginTop: 8,
          padding: "15px 48px",
          borderRadius: 10,
          border: "none",
          background: Y,
          color: "#111",
          fontFamily: FONT,
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          letterSpacing: "0.3px",
          transition: "all 0.15s",
        }}
      >
        Start <span style={{ fontSize: "1.1rem" }}>→</span>
      </button>
    </div>
  );
}

const MAJORS_QUICK = ["Computer Science", "Mechanical Engineering", "Business Analytics", "Biology", "Finance", "Psychology"];
const MAJORS_ALL   = [...MAJORS_QUICK, "Electrical Engineering", "Data Science", "Political Science", "Marketing", "Neuroscience", "Chemistry"];

function Q1Major({ major, setMajor, onNext }) {
  const chips = major.trim()
    ? MAJORS_ALL.filter(m => m.toLowerCase().includes(major.toLowerCase()) && m !== major).slice(0, 6)
    : MAJORS_QUICK;

  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 14 }}>QUESTION 1 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2.4rem,4.5vw,3.4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 36 }}>
        What is your<br />major?
      </h2>
      <input
        autoFocus
        value={major}
        onChange={e => setMajor(e.target.value)}
        style={{
          width: "100%", background: C2,
          border: `2px solid ${Y}`,
          borderRadius: 10, padding: "18px 20px",
          fontFamily: FONT, fontSize: "1.05rem", color: "#fff",
          outline: "none", marginBottom: 18,
          caretColor: Y,
        }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: 40 }}>
        {chips.map(m => (
          <button
            key={m}
            onClick={() => setMajor(m)}
            style={{
              padding: "9px 17px", borderRadius: 100,
              border: `1.5px solid ${BR}`,
              background: C1, color: "#bbb",
              fontFamily: FONT, fontSize: "0.82rem",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = Y; e.currentTarget.style.color = Y; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BR; e.currentTarget.style.color = "#bbb"; }}
          >
            {m}
          </button>
        ))}
      </div>
      <ContinueBtn onClick={onNext} disabled={!major.trim()} />
    </div>
  );
}

function Q2Year({ level, gradYear, setLevel, setGradYear, onNext }) {
  const valid = level && gradYear.length === 4 && /^\d{4}$/.test(gradYear);
  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 14 }}>QUESTION 2 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 44 }}>
        What year are you<br />graduating?
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 56 }}>
        {["Undergrad", "Grad"].map(l => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            style={{
              padding: "11px 26px", borderRadius: 100,
              border: level === l ? `2px solid ${Y}` : `2px solid ${BR}`,
              background: level === l ? "transparent" : C1,
              color: level === l ? Y : "#bbb",
              fontFamily: FONT, fontSize: "0.92rem",
              fontWeight: level === l ? 700 : 400,
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {l}
          </button>
        ))}
        <input
          value={gradYear}
          onChange={e => { if (/^\d{0,4}$/.test(e.target.value)) setGradYear(e.target.value); }}
          placeholder="YYYY"
          maxLength={4}
          style={{
            background: C2,
            border: `2px solid ${gradYear.length === 4 ? Y : BR}`,
            borderRadius: 10, padding: "11px 20px",
            fontFamily: FONT, fontSize: "0.95rem", color: "#fff",
            outline: "none", width: 138,
            caretColor: Y,
            transition: "border-color 0.2s",
          }}
        />
      </div>
      <ContinueBtn onClick={onNext} disabled={!valid} />
    </div>
  );
}

const INTERESTS = ["Technology", "Business", "Art", "Pre-Med", "Gaming", "Music", "Sports", "Research", "Volunteering"];

function Q3Interests({ selected, toggle, onNext }) {
  return (
    <div style={{ width: "100%", maxWidth: 680 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 12 }}>QUESTION 3 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2.2rem,4.5vw,3.4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 26 }}>
        Select your<br />interests
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }}>
        {INTERESTS.map(i => {
          const on = selected.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              style={{
                padding: "26px 16px",
                borderRadius: 13,
                border: on ? `2px solid ${Y}` : `2px solid ${BR}`,
                background: on ? "rgba(253,253,163,0.05)" : C1,
                color: on ? Y : "#aaa",
                fontFamily: FONT, fontSize: "1rem",
                fontWeight: on ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s",
                textAlign: "center",
              }}
            >
              {i}
            </button>
          );
        })}
      </div>
      <ContinueBtn onClick={onNext} disabled={selected.size === 0} />
    </div>
  );
}

const EVENT_TYPES = ["Workshops", "Socials", "Competitions", "Panels", "Networking", "Performances"];

function Q4EventTypes({ selected, toggle, onNext }) {
  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 12 }}>QUESTION 4 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2rem,4.5vw,3.2rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, letterSpacing: "-1.5px", marginBottom: 42 }}>
        Select your<br />type of events
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 56 }}>
        {EVENT_TYPES.map(e => {
          const on = selected.has(e);
          return (
            <button
              key={e}
              onClick={() => toggle(e)}
              style={{
                padding: "13px 26px",
                borderRadius: 100,
                border: on ? `2px solid ${Y}` : `2px solid ${BR}`,
                background: on ? "transparent" : C1,
                color: on ? Y : "#aaa",
                fontFamily: FONT, fontSize: "0.95rem",
                fontWeight: on ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {e}
            </button>
          );
        })}
      </div>
      <ContinueBtn onClick={onNext} disabled={selected.size === 0} />
    </div>
  );
}

const ALL_CLUBS = [
  "ACM UTD", "Comet Entrepreneurs", "UTD Design Club", "AMSA UTD",
  "Game Dev Club", "Astronomy Club", "Investment Club", "Robotics Club",
  "Pre-Law Society", "UTD Choir", "Nebula Labs", "AIS UTD",
  "Dental Club", "CS+Social Good", "Math Club", "Finance Club",
  "Photography Club", "Debate Team", "Esports Club", "Pre-Dental Society",
];

function Q5Clubs({ search, setSearch, selected, toggle, onNext, clubs: clubList, loadingClubs }) {
  const visible = clubList.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 10 }}>QUESTION 5 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3.8vw,2.8rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 22 }}>
        What type of clubs<br />are you interested<br />in?
      </h2>
      <input
        autoFocus
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search clubs..."
        style={{
          width: "100%", background: C2,
          border: `2px solid ${Y}`,
          borderRadius: 10, padding: "14px 18px",
          fontFamily: FONT, fontSize: "0.95rem", color: "#fff",
          outline: "none", marginBottom: 12, caretColor: Y,
        }}
      />
      {loadingClubs ? (
        <p style={{ fontFamily: FONT, color: MU, fontSize: "0.85rem", marginBottom: 12 }}>Loading clubs…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 295, overflowY: "auto", marginBottom: 14, scrollbarWidth: "none" }}>
          {visible.map(c => {
            const on = selected.has(c);
            return (
              <button
                key={c}
                onClick={() => toggle(c)}
                style={{
                  width: "100%", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "17px 20px", borderRadius: 9,
                  border: on ? `1.5px solid ${Y}` : `1.5px solid ${BR}`,
                  background: on ? "rgba(253,253,163,0.04)" : C1,
                  color: on ? Y : TX,
                  fontFamily: FONT, fontSize: "0.95rem",
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}
              >
                <span>{c}</span>
                <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, border: on ? `2px solid ${Y}` : `2px solid ${MU}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: Y, display: "block" }} />}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <ContinueBtn onClick={onNext} />
    </div>
  );
}

function Q6Newsletter({ optIn, setOptIn, onNext }) {
  return (
    <div style={{ width: "100%", maxWidth: 700 }}>
      <p style={{ fontFamily: FONT, fontSize: "0.72rem", color: MU, letterSpacing: "2px", marginBottom: 12 }}>QUESTION 6 OF 6</p>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(1.8rem,3.8vw,2.8rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}>
        Want a weekly<br />digest?
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: MU, lineHeight: 1.75, marginBottom: 34 }}>
        Every Monday — a personalized roundup of the week's best<br />
        club events, curated by AI based on your interests.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
        {[
          { val: true,  label: "Yes, send it to my UTD email",  sub: "Personalized digest every Monday morning" },
          { val: false, label: "No thanks, I'll check the app", sub: "We won't bother you" },
        ].map(opt => {
          const on = optIn === opt.val;
          return (
            <button
              key={String(opt.val)}
              onClick={() => setOptIn(opt.val)}
              style={{
                width: "100%", textAlign: "left",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 22px",
                borderRadius: 10,
                border: on ? `2px solid ${Y}` : `2px solid ${BR}`,
                background: on ? "rgba(253,253,163,0.04)" : C1,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <div>
                <div style={{ fontFamily: FONT, fontSize: "0.95rem", color: on ? Y : TX, fontWeight: on ? 700 : 400 }}>{opt.label}</div>
                <div style={{ fontFamily: FONT, fontSize: "0.78rem", color: MU, marginTop: 4 }}>{opt.sub}</div>
              </div>
              <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginLeft: 16,
                border: on ? `2px solid ${Y}` : `2px solid ${MU}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {on && <span style={{ width: 10, height: 10, borderRadius: "50%", background: Y, display: "block" }} />}
              </span>
            </button>
          );
        })}
      </div>
      <ContinueBtn onClick={onNext} disabled={optIn === null} />
    </div>
  );
}

// Loading screen — advances once BOTH:
//   1. the message animation finishes (~2.5s), AND
//   2. apiReady is true (API done) OR the 4s safety timeout fires
function Loading({ onDone, apiReady }) {
  const [idx, setIdx] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  const msgs = ["Analyzing your profile…", "Matching clubs to your vibe…", "Ranking this week's events…", "Making your mark ✦"];

  // Message ticker — runs once on mount
  useEffect(() => {
    const t = setInterval(() => {
      setIdx(i => {
        if (i >= msgs.length - 1) {
          clearInterval(t);
          setAnimDone(true);
          return i;
        }
        return i + 1;
      });
    }, 620);
    return () => clearInterval(t);
  }, []);

  // Advance when anim done AND (api ready OR timeout elapsed)
  useEffect(() => {
    if (!animDone) return;

    if (apiReady) {
      // API already finished — advance immediately after anim
      const t = setTimeout(onDone, 400);
      return () => clearTimeout(t);
    }

    // API still running — give it a maximum of 4 extra seconds after
    // the animation finishes, then advance anyway so the user isn't stuck
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [animDone, apiReady, onDone]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 28, textAlign: "center" }}>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", letterSpacing: "-1px" }}>
        Making your <span style={{ color: Y }}>mark</span>…
      </h2>
      <div style={{ display: "flex", gap: 14 }}>
        {[Y, "#FF2D78", "#00AADD", "#7B35E8", "#22CC88"].map((c, i) => (
          <div
            key={i}
            style={{
              width: 46, height: 46, background: c,
              borderRadius: ["60% 40% 55% 45%", "50% 60% 40% 55%", "45% 55% 60% 40%", "55% 45% 50% 50%", "50%"][i],
              animation: `splatPop 0.4s ${i * 0.15}s cubic-bezier(0.4,0,0.2,1) both`,
            }}
          />
        ))}
      </div>
      <div style={{ width: 240, height: 5, background: "#1e1e1e", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", background: Y, borderRadius: 3, animation: "loadFill 2.6s cubic-bezier(0.4,0,0.2,1) forwards" }} />
      </div>
      <p style={{ fontFamily: FONT, fontSize: "0.88rem", color: MU }}>{msgs[idx]}</p>
      <style>{`
        @keyframes splatPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1) rotate(0deg);    opacity: 1; }
        }
        @keyframes loadFill { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}

function Done({ major, recommendations, onGo }) {
  const preview = (recommendations || []).slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20, textAlign: "center", padding: "0 24px" }}>
      <div style={{ width: 72, height: 72, borderRadius: 14, background: Y, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#111" }}>✦</div>
      <h2 style={{ fontFamily: FONT, fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
        Your mark is<br /><span style={{ color: Y }}>made.</span>
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MU, maxWidth: 400, lineHeight: 1.75 }}>
        We found clubs matched to your {major || "profile"}. Your personalized calendar is ready.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 500, textAlign: "left" }}>
        {preview.length > 0 ? preview.map((r, i) => (
          <div key={i} style={{ background: C1, border: `2px solid ${BR}`, borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>{r.name}</div>
              <div style={{ fontFamily: FONT, fontSize: "0.76rem", color: MU, marginTop: 2 }}>{r.reason}</div>
            </div>
            <div style={{ background: Y, color: "#111", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 4, flexShrink: 0, fontFamily: FONT }}>Match</div>
          </div>
        )) : (
          <p style={{ fontFamily: FONT, color: MU, fontSize: "0.85rem", textAlign: "center" }}>Loading your matches…</p>
        )}
      </div>
      <div style={{ width: "100%", maxWidth: 500 }}>
        <ContinueBtn onClick={onGo} label="Go to my dashboard →" />
      </div>
    </div>
  );
}

// ─── QUIZ (exported) ─────────────────────────────────────────

export default function Quiz() {
  const navigate = useNavigate();
  const { getIdToken, markOnboardingComplete } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const [step, setStep] = useState(0);
  const [key,  setKey]  = useState(0);

  const [major,        setMajor]        = useState("");
  const [level,        setLevel]        = useState("");
  const [gradYear,     setGradYear]     = useState("");
  const [interests,    setInterests]    = useState(new Set());
  const [eventTypes,   setEvTypes]      = useState(new Set());
  const [clubSearch,   setClubSearch]   = useState("");
  const [clubs,        setClubs]        = useState(new Set());
  const [optIn,        setOptIn]        = useState(null);
  const [nebulaClubs,  setNebulaClubs]  = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [apiReady,     setApiReady]     = useState(false);

  const go   = n => { setKey(k => k + 1); setStep(n); };
  const next = ()  => go(step + 1);

  // Fetch clubs from Nebula when user reaches Q5
  useEffect(() => {
    if (step === 6 && nebulaClubs.length === 0) {
      setLoadingClubs(true);
      getIdToken().then(token => {
        fetch(`${API_URL}/api/clubs/search?q=a`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.json())
          .then(data => {
            const names = (data.clubs || []).map(c => c.name).filter(Boolean);
            setNebulaClubs(names.length > 0 ? names : ALL_CLUBS);
          })
          .catch(() => setNebulaClubs(ALL_CLUBS))
          .finally(() => setLoadingClubs(false));
      }).catch(() => {
        setNebulaClubs(ALL_CLUBS);
        setLoadingClubs(false);
      });
    }
  }, [step]);

  // Submit quiz on loading screen — fires exactly once via ref guard
  const submitCalledRef = useRef(false);
  useEffect(() => {
    if (step === 8 && !submitCalledRef.current) {
      submitCalledRef.current = true;
      setApiReady(false);

      const submit = async () => {
        try {
          const token = await getIdToken();
          const year  = `${level} ${gradYear}`.trim();
          const res   = await fetch(`${API_URL}/api/quiz/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              major,
              year,
              interests:       [...interests],
              clubs:           [...clubs],
              eventTypes:      [...eventTypes],
              newsletterOptIn: optIn || false,
            }),
          });
          const data = await res.json();
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
          // Mark onboarding complete in Firebase/backend
          await markOnboardingComplete({
            major, year,
            interests:       [...interests],
            clubs:           [...clubs],
            eventTypes:      [...eventTypes],
            newsletterOptIn: optIn || false,
          });
        } catch (err) {
          console.error("Quiz submit error:", err);
        } finally {
          // Always unblock the loading screen, even on error
          setApiReady(true);
        }
      };

      submit();
    }

    if (step !== 8) {
      submitCalledRef.current = false;
    }
  }, [step]);

  // Navigate to dashboard after Done screen
  const handleFinish = () => navigate("/dashboard");

  const tog = setter => val =>
    setter(p => { const n = new Set(p); n.has(val) ? n.delete(val) : n.add(val); return n; });

  const TOTAL_Q  = 6;
  const showLogo = step >= 1 && step <= 8;
  const showProg = step >= 2 && step <= 7;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: BG, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Glow step={step} />
      {showProg && <ProgressBar step={step - 1} total={TOTAL_Q} />}
      {showLogo && <Logo />}

      <div
        key={key}
        style={{
          flex: 1,
          display: "flex",
          alignItems: step === 2 || step === 6 ? "flex-start" : "center",
          justifyContent: "center",
          padding: step === 2 || step === 6
            ? "110px 60px 32px"
            : step >= 1 && step <= 7
            ? "88px 60px 36px"
            : "32px 24px",
          position: "relative",
          zIndex: 10,
          animation: "fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
          overflowY: "auto",
        }}
      >
        {step === 0 && <Splash       onDone={next} />}
        {step === 1 && <Intro        onNext={next} />}
        {step === 2 && <Q1Major      major={major} setMajor={setMajor} onNext={next} />}
        {step === 3 && <Q2Year       level={level} gradYear={gradYear} setLevel={setLevel} setGradYear={setGradYear} onNext={next} />}
        {step === 4 && <Q3Interests  selected={interests}  toggle={tog(setInterests)}  onNext={next} />}
        {step === 5 && <Q4EventTypes selected={eventTypes} toggle={tog(setEvTypes)}    onNext={next} />}
        {step === 6 && <Q5Clubs      search={clubSearch} setSearch={setClubSearch} selected={clubs} toggle={tog(setClubs)} onNext={next} clubs={nebulaClubs.length > 0 ? nebulaClubs : ALL_CLUBS} loadingClubs={loadingClubs} />}
        {step === 7 && <Q6Newsletter optIn={optIn} setOptIn={setOptIn} onNext={next} />}
        {step === 8 && <Loading      onDone={next} apiReady={apiReady} />}
        {step === 9 && <Done         major={major} recommendations={recommendations} onGo={handleFinish} />}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #3a3a3a; }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>
    </div>
  );
}