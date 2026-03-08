import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import clubhubLogo from "../assets/clubhubLogo.png";

// ─── TOKENS ──────────────────────────────────────────────────
const BG      = "#0a0a0a";
const SIDEBAR = "#111111";
const TOPBAR  = "#0a0a0a";
const PANEL   = "#111111";
const CARD    = "#1a1a1a";
const CARD2   = "#1e1e1e";
const BORDER  = "#222222";
const Y       = "#FDFDA3";
const TX      = "#f0f0f0";
const TX2     = "#888888";
const MU      = "#444444";

const DISPLAY = "'Bebas Neue', 'Arial Black', sans-serif";
const BODY    = "'DM Sans', system-ui, sans-serif";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_SHORT   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

const TAG_COLORS = {
  NETWORKING:  "#4A9EFF",
  WORKSHOP:    "#22CC88",
  COMPETITION: "#FF2D78",
  PANEL:       "#FF5A00",
  SOCIAL:      "#CC44FF",
};

const CLUB_COLOR_POOL = [
  "#4A9EFF","#FF5A00","#CC44FF","#22CC88","#FF2D78",
  "#FFB800","#00CCCC","#FF6B35","#7B35E8","#00AA44",
];

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function firstDOW(y, m)    { return new Date(y, m - 1, 1).getDay(); }

function formatTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d)) return dt;
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// ─── LEFT SIDEBAR ─────────────────────────────────────────────
// UI from doc1 (uses clubhubLogo image asset)
function LeftSidebar({ onLogout, user, clubs, clubColorMap }) {
  const [hov, setHov] = useState(null);
  const navItems = [
    { icon:"📅", label:"Calendar",     active:true  },
    { icon:"🔍", label:"Discover",     active:false },
    { icon:"⭐", label:"My Clubs",     active:false },
    { icon:"🔖", label:"Saved Events", active:false },
    { icon:"⚙️",  label:"Settings",    active:false },
  ];

  const initials    = user?.name ? user.name[0].toUpperCase() : (user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.name || user?.email?.split("@")[0] || "Student";

  return (
    <div style={{
      width:240, flexShrink:0, background:SIDEBAR,
      borderRight:`1px solid ${BORDER}`,
      display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0,
    }}>
      <div style={{ padding:"20px 18px 16px", display:"flex", alignItems:"center" }}>
        <img src={clubhubLogo} alt="ClubHub" style={{ height:36, width:"auto", display:"block" }} />
      </div>

      <div style={{ height:1, background:BORDER, margin:"0 16px 6px" }}/>

      <div style={{ padding:"6px 10px" }}>
        <p style={{ fontFamily:BODY, fontSize:"0.62rem", color:MU, letterSpacing:"2px", fontWeight:600, padding:"6px 8px 8px" }}>MENU</p>
        {navItems.map(item => {
          const isHov = hov === item.label;
          return (
            <div key={item.label} onMouseEnter={() => setHov(item.label)} onMouseLeave={() => setHov(null)} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"9px 10px", borderRadius:8, marginBottom:1,
              background: item.active ? "rgba(253,253,163,0.12)" : isHov ? "rgba(255,255,255,0.04)" : "transparent",
              border: item.active ? `1px solid rgba(253,253,163,0.2)` : "1px solid transparent",
              cursor:"pointer", transition:"all 0.12s",
            }}>
              <span style={{ fontSize:14, lineHeight:1 }}>{item.icon}</span>
              <span style={{ fontFamily:BODY, fontSize:"0.85rem", fontWeight: item.active ? 600 : 400, color: item.active ? Y : isHov ? TX : TX2 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ height:1, background:BORDER, margin:"6px 16px" }}/>

      <div style={{ padding:"6px 10px", flex:1, overflowY:"auto" }}>
        <p style={{ fontFamily:BODY, fontSize:"0.62rem", color:MU, letterSpacing:"2px", fontWeight:600, padding:"6px 8px 10px" }}>MY CLUBS</p>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {clubs.map(club => (
            <div key={club.clubId} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7, cursor:"pointer", transition:"background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div style={{ width:8, height:8, borderRadius:"50%", background: clubColorMap[club.clubId] || "#888", flexShrink:0 }}/>
              <span style={{ fontFamily:BODY, fontSize:"0.8rem", color:TX2 }}>{club.clubName}</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:Y, flexShrink:0 }}/>
            <span style={{ fontFamily:BODY, fontSize:"0.8rem", color:TX2 }}>✦ AI Picks</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", marginTop:4, borderRadius:7, cursor:"pointer", transition:"all 0.1s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <div style={{ width:16, height:16, borderRadius:4, border:`1.5px dashed ${MU}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:MU, flexShrink:0 }}>+</div>
          <span style={{ fontFamily:BODY, fontSize:"0.78rem", color:MU }}>+ Add club</span>
        </div>
      </div>

      <div style={{ margin:"10px 12px", padding:"12px 12px", borderRadius:10, background:CARD, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:"#2a2a2a", border:`2px solid #333`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:BODY, fontSize:"0.9rem", fontWeight:700, color:"#fff", flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontFamily:BODY, fontSize:"0.82rem", fontWeight:600, color:TX, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
          <p style={{ fontFamily:BODY, fontSize:"0.7rem", color:TX2, marginTop:1 }}>{user?.major || "UTD"} · {user?.year || "Student"}</p>
        </div>
        <button onClick={onLogout} title="Sign out" style={{ marginLeft:"auto", background:"none", border:"none", color:MU, fontSize:14, cursor:"pointer", flexShrink:0, padding:4, borderRadius:4, transition:"color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color=TX2}
          onMouseLeave={e => e.currentTarget.style.color=MU}
        >→</button>
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────
// UI from doc1 (centered nav + heading, Today pinned right)
function TopBar({ year, month, onPrev, onNext, onToday, filters, setFilters, clubs, clubColorMap }) {
  const filterRef = useRef(null);

  useEffect(() => {
    const fn = e => { if (filterRef.current && !filterRef.current.contains(e.target)) {} };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggle     = key => setFilters(p => ({ ...p, [key]: !p[key] }));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ background:TOPBAR, borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"14px 24px 0", position:"relative" }}>
        {/* Centered nav + heading */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={onPrev} style={arrowBtn}>‹</button>
          <h1 style={{ fontFamily:DISPLAY, fontSize:"clamp(1.6rem,2.8vw,2.2rem)", color:"#fff", letterSpacing:"2px", lineHeight:1, margin:0, whiteSpace:"nowrap" }}>
            {MONTH_NAMES[month-1].toUpperCase()}{" "}
            <span style={{ color:TX2 }}>{year}</span>
          </h1>
          <button onClick={onNext} style={arrowBtn}>›</button>
        </div>
        {/* Today button pinned to the right */}
        <button onClick={onToday} style={{ position:"absolute", right:24, padding:"7px 16px", borderRadius:6, background:"transparent", border:`1px solid ${BORDER}`, fontFamily:BODY, fontSize:"0.75rem", color:TX2, cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color=TX;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=TX2;}}
        >Today</button>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px 14px", overflowX:"auto", scrollbarWidth:"none" }}>
        <span style={{ fontFamily:BODY, fontSize:"0.72rem", fontWeight:600, color:MU, letterSpacing:"1.5px", flexShrink:0 }}>FILTER:</span>
        <FilterChip label="✦ AI Recs" active={!!filters.aiRec} color={Y} onClick={() => toggle("aiRec")} />
        {clubs.map(club => (
          <FilterChip key={club.clubId} label={club.clubName} active={!!filters[club.clubId]} color={clubColorMap[club.clubId] || "#888"} onClick={() => toggle(club.clubId)} />
        ))}
        {hasFilters && (
          <button onClick={() => setFilters({})} style={{ padding:"5px 12px", borderRadius:20, flexShrink:0, background:"transparent", border:`1px solid ${BORDER}`, fontFamily:BODY, fontSize:"0.72rem", color:MU, cursor:"pointer" }}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      padding:"5px 14px", borderRadius:20, flexShrink:0,
      background: active ? color : hov ? "rgba(255,255,255,0.05)" : "transparent",
      border:`1px solid ${active ? color : BORDER}`,
      fontFamily:BODY, fontSize:"0.76rem", fontWeight: active ? 600 : 400,
      color: active ? "#111" : hov ? TX : TX2,
      cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
    }}>
      {label}
    </button>
  );
}

// ─── CALENDAR CELL ────────────────────────────────────────────
function CalCell({ day, events, selected, isToday, onClick }) {
  const [hov, setHov] = useState(false);
  const MAX      = 2;
  const shown    = events.slice(0, MAX);
  const overflow = events.length - MAX;

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      minHeight:96, padding:"7px 6px 5px",
      borderRight:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`,
      background: selected ? "rgba(253,253,163,0.05)" : hov ? "rgba(255,255,255,0.018)" : "transparent",
      cursor:"pointer", transition:"background 0.1s",
      display:"flex", flexDirection:"column", gap:3, overflow:"hidden",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{
          fontFamily:DISPLAY, fontSize:"1rem",
          color: isToday ? "#111" : selected ? Y : TX,
          background: isToday ? Y : "transparent",
          borderRadius: isToday ? "50%" : 0,
          width: isToday ? 24 : "auto", height: isToday ? 24 : "auto",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          {day}
        </span>
      </div>
      {shown.map((ev, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"2px 6px", borderRadius:4, background: ev._color + "22", border:`1px solid ${ev._color}44`, overflow:"hidden" }}>
          <span style={{ fontSize:9, flexShrink:0 }}>{ev._emoji}</span>
          <span style={{ fontFamily:BODY, fontSize:"0.62rem", fontWeight:500, color:ev._color, lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {ev.eventName}
          </span>
        </div>
      ))}
      {overflow > 0 && (
        <span style={{ fontFamily:BODY, fontSize:"0.6rem", color:TX2, paddingLeft:2 }}>+{overflow} more</span>
      )}
    </div>
  );
}

// ─── RIGHT PANEL ──────────────────────────────────────────────
function RightPanel({ day, month, year, events, onClose }) {
  const [rsvped,     setRsvped]     = useState({});
  const [email,      setEmail]      = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const dow   = day ? DOW_SHORT[new Date(year, month-1, day).getDay()] : null;
  const label = day ? `${dow}, ${MONTH_NAMES[month-1].slice(0,3).toUpperCase()} ${day}` : null;

  return (
    <div style={{ width:310, flexShrink:0, borderLeft:`1px solid ${BORDER}`, background:PANEL, display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
      <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontFamily:DISPLAY, fontSize:"2rem", color:"#fff", letterSpacing:"1px", lineHeight:1, margin:0 }}>{label || "SELECT A DAY"}</h2>
            <p style={{ fontFamily:BODY, fontSize:"0.76rem", color:TX2, marginTop:6 }}>
              {label ? `${events.length} ${events.length === 1 ? "event" : "events"}` : "Click any date on the calendar"}
            </p>
          </div>
          {day && (
            <button onClick={onClose} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:6, color:TX2, fontSize:"0.7rem", cursor:"pointer", padding:"4px 8px", fontFamily:BODY, marginTop:4 }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {day && events.length === 0 && (
          <div style={{ textAlign:"center", padding:"30px 0" }}>
            <p style={{ fontFamily:DISPLAY, fontSize:"1.2rem", color:MU, letterSpacing:"1px" }}>NO EVENTS</p>
            <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:MU, marginTop:4 }}>Nothing scheduled this day</p>
          </div>
        )}
        {events.map((ev, i) => {
          const done = rsvped[i];
          return (
            <div key={i} style={{ borderRadius:12, background:CARD, border:`1px solid ${BORDER}`, overflow:"hidden", transition:"border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = ev._color + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px 8px" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:CARD2, border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                  {ev._emoji}
                </div>
                <span style={{ background: TAG_COLORS.SOCIAL + "22", color: TAG_COLORS.SOCIAL, border:`1px solid ${TAG_COLORS.SOCIAL}44`, fontFamily:BODY, fontSize:"0.62rem", fontWeight:700, padding:"3px 8px", borderRadius:5, letterSpacing:"0.8px" }}>
                  EVENT
                </span>
              </div>
              <div style={{ padding:"0 14px 12px", display:"flex", flexDirection:"column", gap:8 }}>
                {ev._isAiRec && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:`${Y}18`, color:Y, border:`1px solid ${Y}33`, fontFamily:BODY, fontSize:"0.65rem", fontWeight:700, padding:"2px 8px", borderRadius:4, width:"fit-content", letterSpacing:"0.5px" }}>
                    ✦ AI Pick
                  </span>
                )}
                <h3 style={{ fontFamily:DISPLAY, fontSize:"1.1rem", color:"#fff", letterSpacing:"0.5px", margin:0, lineHeight:1.2 }}>
                  {ev.eventName?.toUpperCase()}
                </h3>
                <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:ev._color, margin:0 }}>{ev.organizationName}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <span style={{ fontFamily:BODY, fontSize:"0.72rem", color:TX2 }}>⏰ {formatTime(ev.startTime)}{ev.endTime ? ` – ${formatTime(ev.endTime)}` : ""}</span>
                  <span style={{ fontFamily:BODY, fontSize:"0.72rem", color:TX2 }}>📍 {ev.location || ev.building || "TBD"}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", marginTop:2 }}>
                  <button onClick={() => setRsvped(p => ({ ...p, [i]: !p[i] }))} style={{
                    padding:"7px 18px", borderRadius:7, border:"none",
                    background: done ? "#1a3a1a" : Y,
                    color: done ? "#22CC88" : "#111",
                    fontFamily:BODY, fontSize:"0.75rem", fontWeight:700,
                    cursor:"pointer", transition:"all 0.2s",
                  }}>
                    {done ? "✓ RSVP'd" : "RSVP"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding:"14px 16px", borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
        <h3 style={{ fontFamily:DISPLAY, fontSize:"1.1rem", color:"#fff", letterSpacing:"1px", margin:"0 0 4px" }}>
          WEEKLY <span style={{ color:Y }}>DIGEST</span>
        </h3>
        <p style={{ fontFamily:BODY, fontSize:"0.68rem", color:TX2, margin:"0 0 10px", lineHeight:1.5 }}>
          Get personalized events every Monday — curated by AI.
        </p>
        {subscribed ? (
          <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:"#22CC88", fontWeight:600 }}>✓ You're subscribed!</p>
        ) : (
          <div style={{ display:"flex", gap:6 }}>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="utd email..."
              style={{ flex:1, padding:"8px 10px", borderRadius:7, background:CARD, border:`1px solid ${BORDER}`, fontFamily:BODY, fontSize:"0.72rem", color:TX, outline:"none", caretColor:Y }}
              onFocus={e => e.target.style.borderColor=Y+"88"}
              onBlur={e  => e.target.style.borderColor=BORDER}
            />
            <button onClick={() => { if (email) setSubscribed(true); }} style={{ padding:"8px 12px", borderRadius:7, border:"none", background:Y, color:"#111", fontFamily:BODY, fontSize:"0.72rem", fontWeight:700, cursor:"pointer", flexShrink:0 }}>
              Subscribe
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD ROOT ───────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, getIdToken } = useAuth();
  const navigate = useNavigate();
  const API_URL  = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const now = new Date();
  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonth]       = useState(now.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filters,     setFilters]     = useState({});

  // Real data
  const [followedClubs,   setFollowedClubs]   = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [events,          setEvents]          = useState([]);
  const [loadingEvents,   setLoadingEvents]   = useState(false);
  const [clubColorMap,    setClubColorMap]    = useState({});

  // Fetch followed clubs once on mount
  useEffect(() => {
    const load = async () => {
      const token = await getIdToken();
      const res   = await fetch(`${API_URL}/api/clubs/followed`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      const clubs = data.clubs || [];
      setFollowedClubs(clubs);
      const map = {};
      clubs.forEach((club, i) => { map[club.clubId] = CLUB_COLOR_POOL[i % CLUB_COLOR_POOL.length]; });
      setClubColorMap(map);
    };
    load().catch(console.error);
  }, []);

  // Fetch recommendations once on mount (for AI pick detection)
  useEffect(() => {
    const load = async () => {
      const token = await getIdToken();
      const res   = await fetch(`${API_URL}/api/recommendations`, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      setRecommendations(data.recommendations || []);
    };
    load().catch(console.error);
  }, []);

  // Fetch events whenever year/month changes
  useEffect(() => {
    const load = async () => {
      setLoadingEvents(true);
      try {
        const token = await getIdToken();
        const res   = await fetch(`${API_URL}/api/events/calendar/${year}/${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        const raw   = data.events || [];

        const recNames = new Set(recommendations.map(r => r.name?.toLowerCase().trim()));
        const enriched = raw.map(ev => {
          const orgLower    = ev.organizationName?.toLowerCase().trim() || "";
          const isAiRec     = [...recNames].some(n => orgLower.includes(n) || n.includes(orgLower));
          const matchedClub = followedClubs.find(c =>
            c.clubName?.toLowerCase().trim() === orgLower ||
            orgLower.includes(c.clubName?.toLowerCase().trim())
          );
          const color = isAiRec
            ? Y
            : matchedClub ? (clubColorMap[matchedClub.clubId] || "#888") : "#888";
          return {
            ...ev,
            _isAiRec: isAiRec,
            _color:   color,
            _emoji:   isAiRec ? "✦" : "📌",
            _day:     new Date(ev.startTime).getDate(),
          };
        });

        setEvents(enriched);
      } catch (err) {
        console.error("Failed to fetch calendar events:", err);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, [year, month, recommendations, followedClubs, clubColorMap]);

  const prevMonth    = () => { setSelectedDay(null); if (month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const nextMonth    = () => { setSelectedDay(null); if (month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday      = () => { setSelectedDay(null); setYear(now.getFullYear()); setMonth(now.getMonth()+1); };
  const handleLogout = async () => { await logout(); navigate("/"); };

  // Filter events
  const hasFilters = Object.values(filters).some(Boolean);
  const visible    = hasFilters
    ? events.filter(ev => {
        if (filters.aiRec && ev._isAiRec) return true;
        const matchedClub = followedClubs.find(c =>
          c.clubName?.toLowerCase().trim() === ev.organizationName?.toLowerCase().trim()
        );
        return matchedClub && filters[matchedClub.clubId];
      })
    : events;

  // Calendar grid
  const fd    = firstDOW(year, month);
  const dim   = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < fd; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = now.getFullYear()===year && now.getMonth()+1===month;
  const todayDate      = isCurrentMonth ? now.getDate() : -1;
  const dayEvents      = selectedDay ? visible.filter(e => e._day === selectedDay) : [];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ display:"flex", height:"100vh", width:"100vw", background:BG, overflow:"hidden" }}>
        <LeftSidebar onLogout={handleLogout} user={user} clubs={followedClubs} clubColorMap={clubColorMap} />

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          <TopBar
            year={year} month={month}
            onPrev={prevMonth} onNext={nextMonth} onToday={goToday}
            filters={filters} setFilters={setFilters}
            clubs={followedClubs} clubColorMap={clubColorMap}
          />

          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            <div style={{ flex:1, overflow:"auto", minWidth:0 }}>
              {/* Day headers */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:`1px solid ${BORDER}`, borderRight:`1px solid ${BORDER}`, position:"sticky", top:0, background:BG, zIndex:10 }}>
                {DOW_SHORT.map(d => (
                  <div key={d} style={{ fontFamily:BODY, fontSize:"0.65rem", fontWeight:600, color:TX2, textAlign:"center", letterSpacing:"1.5px", padding:"10px 0", borderLeft:`1px solid ${BORDER}` }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Cells grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderLeft:`1px solid ${BORDER}`, borderTop:`1px solid ${BORDER}` }}>
                {cells.map((day, idx) => {
                  if (!day) return (
                    <div key={`e-${idx}`} style={{ minHeight:96, borderRight:`1px solid ${BORDER}`, borderBottom:`1px solid ${BORDER}`, background:"rgba(255,255,255,0.008)" }}/>
                  );
                  const dayEvs = loadingEvents ? [] : visible.filter(e => e._day === day);
                  return (
                    <CalCell
                      key={day} day={day} events={dayEvs}
                      selected={selectedDay===day}
                      isToday={day===todayDate}
                      onClick={() => setSelectedDay(day===selectedDay ? null : day)}
                    />
                  );
                })}
              </div>
            </div>

            <RightPanel
              day={selectedDay} month={month} year={year}
              events={dayEvents}
              onClose={() => setSelectedDay(null)}
            />
          </div>
        </div>
      </div>

      <style>{`
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: ${BG};
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2a2a2a; border-radius:2px; }
        input::placeholder { color:#333; }
      `}</style>
    </>
  );
}

const arrowBtn = {
  background:"none", border:`1px solid ${BORDER}`, borderRadius:6,
  color:TX2, fontFamily:DISPLAY, fontSize:"1.2rem",
  padding:"4px 12px", cursor:"pointer", lineHeight:1,
  transition:"all 0.15s",
};