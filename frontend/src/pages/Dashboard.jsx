import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// ─── TOKENS ──────────────────────────────────────────────────
const BG      = "#0a0a0a";
const SIDEBAR = "#111111";
const TOPBAR  = "#0a0a0a";
const PANEL   = "#111111";
const CARD    = "#1a1a1a";
const CARD2   = "#1e1e1e";
const BORDER  = "#222222";
const Y       = "#FDFDA3";   // AI recs + brand yellow
const TX      = "#f0f0f0";
const TX2     = "#888888";
const MU      = "#444444";

// Display font loaded via Google Fonts (injected in style tag)
const DISPLAY = "'Bebas Neue', 'Arial Black', sans-serif";
const BODY    = "'DM Sans', system-ui, sans-serif";
const MONO    = "'Courier New', monospace";

// ─── CLUBS ───────────────────────────────────────────────────
const CLUBS = [
  { id:"acm",    name:"ACM UTD",             emoji:"🖥️",  color:"#4A9EFF" },
  { id:"comet",  name:"Comet Entrepreneurs",  emoji:"🚀",  color:"#FF5A00" },
  { id:"design", name:"UTD Design Club",      emoji:"🎨",  color:"#CC44FF" },
  { id:"aisa",   name:"AIS UTD",              emoji:"🤖",  color:"#22CC88" },
  { id:"game",   name:"Game Dev Club",         emoji:"🎮",  color:"#FF2D78" },
];

// ─── EVENTS ──────────────────────────────────────────────────
const RAW_EVENTS = [
  { id:1,  y:2026,m:3,  d:3,  club:"acm",    title:"ACM Weekly Meeting",        time:"6:00 PM", loc:"ECSS 2.415",    aiRec:false, tag:"SOCIAL",      going:34,  desc:"Weekly general meeting with project updates and open hacking time." },
  { id:2,  y:2026,m:3,  d:5,  club:null,     title:"Industry Panel: Big Tech",  time:"5:00 PM", loc:"SU 2.02",       aiRec:true,  tag:"NETWORKING",  going:112, desc:"Recruiters from Google, Microsoft, and Amazon share insights on breaking in." },
  { id:3,  y:2026,m:3,  d:7,  club:"comet",  title:"Pitch Practice Night",      time:"7:00 PM", loc:"JSOM 1.217",    aiRec:false, tag:"WORKSHOP",    going:28,  desc:"Refine your startup pitch with founder feedback." },
  { id:4,  y:2026,m:3,  d:9,  club:null,     title:"AI/ML Workshop",            time:"4:00 PM", loc:"ECS 1.315",     aiRec:true,  tag:"WORKSHOP",    going:67,  desc:"Hands-on intro to PyTorch and neural network basics." },
  { id:5,  y:2026,m:3,  d:10, club:"design", title:"Design Sprint",             time:"3:00 PM", loc:"Arts Bldg 1",   aiRec:false, tag:"WORKSHOP",    going:19,  desc:"Collaborative UX session — bring your Figma skills." },
  { id:6,  y:2026,m:3,  d:12, club:"acm",    title:"Hackathon Kickoff",         time:"9:00 AM", loc:"ECSS Atrium",   aiRec:false, tag:"COMPETITION", going:84,  desc:"36-hour hackathon begins. Teams of up to 4." },
  { id:7,  y:2026,m:3,  d:12, club:null,     title:"Resume Workshop",           time:"2:00 PM", loc:"SU 1.701",      aiRec:true,  tag:"WORKSHOP",    going:55,  desc:"CS-focused resume review with industry mentors." },
  { id:8,  y:2026,m:3,  d:14, club:"aisa",   title:"AIS Social Night",          time:"7:30 PM", loc:"Student Union",  aiRec:false, tag:"SOCIAL",      going:41,  desc:"Casual mixer for AI and data science enthusiasts." },
  { id:9,  y:2026,m:3,  d:16, club:null,     title:"Networking Mixer",          time:"6:00 PM", loc:"JSOM Atrium",   aiRec:true,  tag:"NETWORKING",  going:78,  desc:"Meet professionals from DFW's top tech companies." },
  { id:10, y:2026,m:3,  d:18, club:"game",   title:"Game Jam Kickoff",          time:"5:00 PM", loc:"ECSS 4.619",    aiRec:false, tag:"COMPETITION", going:52,  desc:"48-hour game jam — any engine, any genre." },
  { id:11, y:2026,m:3,  d:19, club:"comet",  title:"Founder Fireside Chat",     time:"6:30 PM", loc:"JSOM 1.114",    aiRec:false, tag:"PANEL",       going:36,  desc:"Local founder shares the journey from idea to funding." },
  { id:12, y:2026,m:3,  d:20, club:null,     title:"LeetCode Study Group",      time:"4:00 PM", loc:"McDermott Lib", aiRec:true,  tag:"WORKSHOP",    going:29,  desc:"Weekly group session on interview prep and problem solving." },
  { id:13, y:2026,m:3,  d:21, club:"acm",    title:"ACM × Design Collab",       time:"5:00 PM", loc:"ECSS 2.415",    aiRec:false, tag:"SOCIAL",      going:44,  desc:"Build and design a mini app in one night." },
  { id:14, y:2026,m:3,  d:23, club:"design", title:"Portfolio Review",          time:"3:00 PM", loc:"Arts Bldg 2",   aiRec:false, tag:"WORKSHOP",    going:17,  desc:"Get portfolio feedback from seniors and alumni." },
  { id:15, y:2026,m:3,  d:24, club:null,     title:"Internship Panel",          time:"5:30 PM", loc:"SU 2.02",       aiRec:true,  tag:"PANEL",       going:93,  desc:"Students share SWE internship experiences at top companies." },
  { id:16, y:2026,m:3,  d:26, club:"aisa",   title:"ML Paper Reading",          time:"6:00 PM", loc:"ECSS 2.203",    aiRec:false, tag:"WORKSHOP",    going:22,  desc:"Discussing recent breakthroughs in large language models." },
  { id:17, y:2026,m:3,  d:27, club:"game",   title:"Game Dev Showcase",         time:"4:00 PM", loc:"ECSS Atrium",   aiRec:false, tag:"SOCIAL",      going:61,  desc:"Show off games built during the jam — voting and prizes." },
  { id:18, y:2026,m:3,  d:28, club:null,     title:"Spring Career Fair",        time:"10:00 AM",loc:"SU Ballroom",    aiRec:true,  tag:"NETWORKING",  going:240, desc:"100+ companies recruiting for internships and full-time." },
  { id:19, y:2026,m:4,  d:2,  club:"acm",    title:"ACM Weekly Meeting",        time:"6:00 PM", loc:"ECSS 2.415",    aiRec:false, tag:"SOCIAL",      going:30,  desc:"Weekly general meeting." },
  { id:20, y:2026,m:4,  d:4,  club:null,     title:"Spring Tech Summit",        time:"9:00 AM", loc:"SU Ballroom",   aiRec:true,  tag:"NETWORKING",  going:180, desc:"Full-day conference featuring UTD research and industry talks." },
  { id:21, y:2026,m:4,  d:7,  club:"design", title:"UI/UX Critique Night",      time:"6:00 PM", loc:"Arts Bldg 1",   aiRec:false, tag:"WORKSHOP",    going:21,  desc:"Peer critique of live projects." },
  { id:22, y:2026,m:4,  d:10, club:"comet",  title:"Investor Demo Day",         time:"3:00 PM", loc:"JSOM 1.114",    aiRec:false, tag:"PANEL",       going:45,  desc:"Student startups pitch to real investors." },
  { id:23, y:2026,m:4,  d:14, club:null,     title:"Grad School Info Panel",    time:"5:00 PM", loc:"ECS 1.315",     aiRec:true,  tag:"PANEL",       going:58,  desc:"Faculty and PhD students answer grad school questions." },
  { id:24, y:2026,m:4,  d:18, club:"game",   title:"Indie Game Night",          time:"5:00 PM", loc:"ECSS 4.619",    aiRec:false, tag:"SOCIAL",      going:39,  desc:"Play and review indie games together." },
  { id:25, y:2026,m:2,  d:12, club:null,     title:"Career Prep Workshop",      time:"4:00 PM", loc:"SU 1.701",      aiRec:true,  tag:"WORKSHOP",    going:47,  desc:"Resume and LinkedIn optimization session." },
  { id:26, y:2026,m:2,  d:18, club:"comet",  title:"Startup Ideation Night",    time:"7:00 PM", loc:"JSOM 1.217",    aiRec:false, tag:"WORKSHOP",    going:25,  desc:"Brainstorm your next big idea with fellow founders." },
];

const TAG_COLORS = {
  NETWORKING:  "#4A9EFF",
  WORKSHOP:    "#22CC88",
  COMPETITION: "#FF2D78",
  PANEL:       "#FF5A00",
  SOCIAL:      "#CC44FF",
};

const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_SHORT    = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function firstDOW(y, m)    { return new Date(y, m - 1, 1).getDay(); }
function getClub(id)        { return CLUBS.find(c => c.id === id) ?? null; }
function evColor(ev)        { return ev.aiRec ? Y : (getClub(ev.club)?.color ?? "#888"); }
function evEmoji(ev)        { return ev.aiRec ? "✦" : (getClub(ev.club)?.emoji ?? "📌"); }

// ─── LEFT SIDEBAR ─────────────────────────────────────────────
function LeftSidebar({ onLogout, user }) {
  const [hov, setHov] = useState(null);
  const navItems = [
    { icon:"📅", label:"Calendar",     active:true  },
    { icon:"🔍", label:"Discover",     active:false },
    { icon:"⭐", label:"My Clubs",     active:false },
    { icon:"🔖", label:"Saved Events", active:false },
    { icon:"⚙️",  label:"Settings",    active:false },
  ];

  // Initials from email
  const initials = user?.name
    ? user.name[0].toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.name || user?.email?.split("@")[0] || "Student";

  return (
    <div style={{
      width:240, flexShrink:0, background:SIDEBAR,
      borderRight:`1px solid ${BORDER}`,
      display:"flex", flexDirection:"column",
      height:"100vh", position:"sticky", top:0,
    }}>
      {/* Logo block */}
      <div style={{ padding:"20px 18px 16px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background:Y, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, flexShrink:0,
        }}>✦</div>
        <div>
          <div style={{ fontFamily:DISPLAY, fontSize:17, color:"#fff", lineHeight:1.1, letterSpacing:"0.5px" }}>
            UTD<br/>ClubHub
          </div>
        </div>
      </div>

      <div style={{ height:1, background:BORDER, margin:"0 16px 6px" }}/>

      {/* Nav section */}
      <div style={{ padding:"6px 10px" }}>
        <p style={{ fontFamily:BODY, fontSize:"0.62rem", color:MU, letterSpacing:"2px", fontWeight:600, padding:"6px 8px 8px" }}>MENU</p>
        {navItems.map(item => {
          const isHov = hov === item.label;
          return (
            <div
              key={item.label}
              onMouseEnter={() => setHov(item.label)}
              onMouseLeave={() => setHov(null)}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 10px", borderRadius:8, marginBottom:1,
                background: item.active
                  ? "rgba(253,253,163,0.12)"
                  : isHov ? "rgba(255,255,255,0.04)" : "transparent",
                border: item.active ? `1px solid rgba(253,253,163,0.2)` : "1px solid transparent",
                cursor:"pointer", transition:"all 0.12s",
              }}
            >
              <span style={{ fontSize:14, lineHeight:1 }}>{item.icon}</span>
              <span style={{
                fontFamily:BODY, fontSize:"0.85rem", fontWeight: item.active ? 600 : 400,
                color: item.active ? Y : isHov ? TX : TX2,
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ height:1, background:BORDER, margin:"6px 16px" }}/>

      {/* My Clubs */}
      <div style={{ padding:"6px 10px", flex:1, overflowY:"auto" }}>
        <p style={{ fontFamily:BODY, fontSize:"0.62rem", color:MU, letterSpacing:"2px", fontWeight:600, padding:"6px 8px 10px" }}>MY CLUBS</p>
        <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
          {CLUBS.map(club => (
            <div key={club.id} style={{
              display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7,
              cursor:"pointer",
              transition:"background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div style={{ width:8, height:8, borderRadius:"50%", background:club.color, flexShrink:0 }}/>
              <span style={{ fontFamily:BODY, fontSize:"0.8rem", color:TX2 }}>
                {club.emoji} {club.name}
              </span>
            </div>
          ))}
          {/* AI Recs entry */}
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:7 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:Y, flexShrink:0 }}/>
            <span style={{ fontFamily:BODY, fontSize:"0.8rem", color:TX2 }}>✦ AI Picks</span>
          </div>
        </div>

        {/* Add club */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"7px 10px", marginTop:4, borderRadius:7, cursor:"pointer",
          transition:"all 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
        >
          <div style={{
            width:16, height:16, borderRadius:4,
            border:`1.5px dashed ${MU}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, color:MU, flexShrink:0,
          }}>+</div>
          <span style={{ fontFamily:BODY, fontSize:"0.78rem", color:MU }}>+ Add club</span>
        </div>
      </div>

      {/* User card */}
      <div style={{
        margin:"10px 12px", padding:"12px 12px",
        borderRadius:10, background:CARD,
        border:`1px solid ${BORDER}`,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <div style={{
          width:34, height:34, borderRadius:8,
          background:"#2a2a2a",
          border:`2px solid #333`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:BODY, fontSize:"0.9rem", fontWeight:700, color:"#fff",
          flexShrink:0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontFamily:BODY, fontSize:"0.82rem", fontWeight:600, color:TX, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {displayName}
          </p>
          <p style={{ fontFamily:BODY, fontSize:"0.7rem", color:TX2, marginTop:1 }}>CS · Junior</p>
        </div>
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            marginLeft:"auto", background:"none", border:"none",
            color:MU, fontSize:14, cursor:"pointer", flexShrink:0,
            padding:4, borderRadius:4, transition:"color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color=TX2}
          onMouseLeave={e => e.currentTarget.style.color=MU}
        >→</button>
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────
function TopBar({ year, month, onPrev, onNext, onToday, filters, setFilters }) {
  const filterRef = useRef(null);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    const fn = e => { if (filterRef.current && !filterRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const toggle = key => setFilters(p => ({ ...p, [key]: !p[key] }));
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{
      background:TOPBAR,
      borderBottom:`1px solid ${BORDER}`,
      flexShrink:0,
    }}>
      {/* Row 1 — month heading + month/week toggle */}
      <div style={{
        display:"flex", alignItems:"flex-end", gap:20,
        padding:"16px 24px 0",
      }}>
        {/* Month nav + title */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onPrev} style={arrowBtn}>‹</button>
          <h1 style={{
            fontFamily:DISPLAY, fontSize:"clamp(2rem,3.5vw,2.8rem)",
            color:"#fff", letterSpacing:"1px", lineHeight:1, margin:0,
            minWidth:220,
          }}>
            {MONTH_NAMES[month-1].toUpperCase()}<br/>
            <span style={{ fontSize:"0.6em", color:TX2 }}>{year}</span>
          </h1>
          <button onClick={onNext} style={arrowBtn}>›</button>
        </div>

        {/* Month / Week pills */}
        <div style={{ display:"flex", gap:0, marginBottom:4 }}>
          {["Month","Week"].map((v,i) => (
            <button key={v} style={{
              padding:"7px 20px",
              background: i===0 ? Y : "transparent",
              border: i===0 ? "none" : `1px solid ${BORDER}`,
              borderRadius: i===0 ? "6px 0 0 6px" : "0 6px 6px 0",
              fontFamily:BODY, fontSize:"0.78rem", fontWeight: i===0 ? 700 : 400,
              color: i===0 ? "#111" : TX2,
              cursor:"pointer",
            }}>
              {v}
            </button>
          ))}
        </div>

        {/* Today */}
        <button onClick={onToday} style={{
          padding:"7px 16px", borderRadius:6,
          background:"transparent", border:`1px solid ${BORDER}`,
          fontFamily:BODY, fontSize:"0.75rem", color:TX2,
          cursor:"pointer", marginBottom:4,
          transition:"all 0.15s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#555";e.currentTarget.style.color=TX;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.color=TX2;}}
        >Today</button>
      </div>

      {/* Row 2 — filter chips, scrollable */}
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"10px 24px 14px",
        overflowX:"auto", scrollbarWidth:"none",
      }}>
        <span style={{ fontFamily:BODY, fontSize:"0.72rem", fontWeight:600, color:MU, letterSpacing:"1.5px", flexShrink:0 }}>
          FILTER:
        </span>

        {/* AI Recs chip */}
        <FilterChip
          label="✦ AI Recs"
          active={!!filters.aiRec}
          color={Y}
          onClick={() => toggle("aiRec")}
        />

        {/* Club chips */}
        {CLUBS.map(club => (
          <FilterChip
            key={club.id}
            label={`${club.emoji} ${club.name}`}
            active={!!filters[club.id]}
            color={club.color}
            onClick={() => toggle(club.id)}
          />
        ))}

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => setFilters({})}
            style={{
              padding:"5px 12px", borderRadius:20, flexShrink:0,
              background:"transparent", border:`1px solid ${BORDER}`,
              fontFamily:BODY, fontSize:"0.72rem", color:MU,
              cursor:"pointer", transition:"all 0.15s",
            }}
          >
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
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:"5px 14px", borderRadius:20, flexShrink:0,
        background: active ? color : hov ? "rgba(255,255,255,0.05)" : "transparent",
        border:`1px solid ${active ? color : BORDER}`,
        fontFamily:BODY, fontSize:"0.76rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#111" : hov ? TX : TX2,
        cursor:"pointer", transition:"all 0.15s",
        whiteSpace:"nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── CALENDAR CELL ────────────────────────────────────────────
function CalCell({ day, events, selected, isToday, onClick }) {
  const [hov, setHov] = useState(false);
  const MAX = 2;
  const shown    = events.slice(0, MAX);
  const overflow = events.length - MAX;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minHeight:96, padding:"7px 6px 5px",
        borderRadius:0,
        borderRight:`1px solid ${BORDER}`,
        borderBottom:`1px solid ${BORDER}`,
        background: selected
          ? "rgba(253,253,163,0.05)"
          : hov ? "rgba(255,255,255,0.018)" : "transparent",
        cursor:"pointer", transition:"background 0.1s",
        display:"flex", flexDirection:"column", gap:3,
        overflow:"hidden",
        position:"relative",
      }}
    >
      {/* Day number */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{
          fontFamily:DISPLAY, fontSize:"1rem",
          color: isToday ? "#111" : selected ? Y : TX,
          background: isToday ? Y : "transparent",
          borderRadius: isToday ? "50%" : 0,
          width: isToday ? 24 : "auto",
          height: isToday ? 24 : "auto",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0,
        }}>
          {day}
        </span>
      </div>

      {/* Event pills */}
      {shown.map(ev => {
        const color = evColor(ev);
        return (
          <div key={ev.id} style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"2px 6px", borderRadius:4,
            background: color + "22",
            border:`1px solid ${color}44`,
            overflow:"hidden",
          }}>
            <span style={{ fontSize:9, flexShrink:0 }}>{evEmoji(ev)}</span>
            <span style={{
              fontFamily:BODY, fontSize:"0.62rem", fontWeight:500,
              color, lineHeight:1.3,
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            }}>
              {ev.title}
            </span>
          </div>
        );
      })}

      {overflow > 0 && (
        <span style={{ fontFamily:BODY, fontSize:"0.6rem", color:TX2, paddingLeft:2 }}>
          +{overflow} more
        </span>
      )}
    </div>
  );
}

// ─── RIGHT PANEL ──────────────────────────────────────────────
function RightPanel({ day, month, year, events, onClose }) {
  const [rsvped,    setRsvped]    = useState({});
  const [email,     setEmail]     = useState("");
  const [subscribed,setSubscribed]= useState(false);

  const dow   = day ? DOW_SHORT[new Date(year, month-1, day).getDay()] : null;
  const label = day ? `${dow}, ${MONTH_NAMES[month-1].slice(0,3).toUpperCase()} ${day}` : null;

  return (
    <div style={{
      width:310, flexShrink:0,
      borderLeft:`1px solid ${BORDER}`,
      background:PANEL,
      display:"flex", flexDirection:"column",
      height:"100%",
      overflow:"hidden",
    }}>

      {/* Day header */}
      <div style={{
        padding:"20px 20px 16px",
        borderBottom:`1px solid ${BORDER}`,
        flexShrink:0,
      }}>
        {label ? (
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontFamily:DISPLAY, fontSize:"2rem", color:"#fff", letterSpacing:"1px", lineHeight:1, margin:0 }}>
                {label}
              </h2>
              <p style={{ fontFamily:BODY, fontSize:"0.76rem", color:TX2, marginTop:6 }}>
                {events.length} {events.length === 1 ? "event" : "events"}
              </p>
            </div>
            <button onClick={onClose} style={{
              background:CARD, border:`1px solid ${BORDER}`, borderRadius:6,
              color:TX2, fontSize:"0.7rem", cursor:"pointer",
              padding:"4px 8px", fontFamily:BODY, marginTop:4,
            }}>✕</button>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"10px 0" }}>
            <p style={{ fontFamily:DISPLAY, fontSize:"1.4rem", color:MU, letterSpacing:"1px" }}>SELECT A DAY</p>
            <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:MU, marginTop:4 }}>Click any date on the calendar</p>
          </div>
        )}
      </div>

      {/* Events scroll */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {day && events.length === 0 && (
          <div style={{ textAlign:"center", padding:"30px 0" }}>
            <p style={{ fontFamily:DISPLAY, fontSize:"1.2rem", color:MU, letterSpacing:"1px" }}>NO EVENTS</p>
            <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:MU, marginTop:4 }}>Nothing scheduled this day</p>
          </div>
        )}

        {events.map(ev => {
          const color = evColor(ev);
          const club  = ev.club ? getClub(ev.club) : null;
          const done  = rsvped[ev.id];
          return (
            <div key={ev.id} style={{
              borderRadius:12, background:CARD,
              border:`1px solid ${BORDER}`,
              overflow:"hidden",
              transition:"border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color+"66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
            >
              {/* Card top: emoji icon + tag */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 14px 8px",
              }}>
                <div style={{
                  width:36, height:36, borderRadius:8,
                  background:CARD2, border:`1px solid ${BORDER}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16,
                }}>
                  {evEmoji(ev)}
                </div>
                {ev.tag && (
                  <span style={{
                    background: TAG_COLORS[ev.tag] + "22",
                    color: TAG_COLORS[ev.tag],
                    border:`1px solid ${TAG_COLORS[ev.tag]}44`,
                    fontFamily:BODY, fontSize:"0.62rem", fontWeight:700,
                    padding:"3px 8px", borderRadius:5, letterSpacing:"0.8px",
                  }}>
                    {ev.tag}
                  </span>
                )}
              </div>

              <div style={{ padding:"0 14px 12px", display:"flex", flexDirection:"column", gap:8 }}>
                {/* AI Pick badge */}
                {ev.aiRec && (
                  <span style={{
                    display:"inline-flex", alignItems:"center", gap:4,
                    background:`${Y}18`, color:Y,
                    border:`1px solid ${Y}33`,
                    fontFamily:BODY, fontSize:"0.65rem", fontWeight:700,
                    padding:"2px 8px", borderRadius:4, width:"fit-content",
                    letterSpacing:"0.5px",
                  }}>
                    ✦ AI Pick
                  </span>
                )}

                {/* Title */}
                <h3 style={{ fontFamily:DISPLAY, fontSize:"1.1rem", color:"#fff", letterSpacing:"0.5px", margin:0, lineHeight:1.2 }}>
                  {ev.title.toUpperCase()}
                </h3>

                {/* Club */}
                {club && (
                  <p style={{ fontFamily:BODY, fontSize:"0.72rem", color, margin:0 }}>
                    {club.emoji} {club.name}
                  </p>
                )}

                {/* Time / location */}
                <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                  <span style={{ fontFamily:BODY, fontSize:"0.72rem", color:TX2 }}>⏰ {ev.time}</span>
                  <span style={{ fontFamily:BODY, fontSize:"0.72rem", color:TX2 }}>📍 {ev.loc}</span>
                </div>

                {/* Desc */}
                <p style={{ fontFamily:BODY, fontSize:"0.72rem", color:"#666", lineHeight:1.6, margin:0 }}>
                  {ev.desc}
                </p>

                {/* Going + RSVP */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:2 }}>
                  <span style={{ fontFamily:BODY, fontSize:"0.78rem", color:TX2 }}>
                    <span style={{ fontWeight:700, color:TX }}>{ev.going}</span> going
                  </span>
                  <button
                    onClick={() => setRsvped(p => ({ ...p, [ev.id]: !p[ev.id] }))}
                    style={{
                      padding:"7px 18px", borderRadius:7, border:"none",
                      background: done ? "#1a3a1a" : Y,
                      color: done ? "#22CC88" : "#111",
                      fontFamily:BODY, fontSize:"0.75rem", fontWeight:700,
                      cursor:"pointer", transition:"all 0.2s",
                    }}
                  >
                    {done ? "✓ RSVP'd" : "RSVP"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly digest */}
      <div style={{
        padding:"14px 16px", borderTop:`1px solid ${BORDER}`,
        flexShrink:0,
      }}>
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
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="utd email..."
              style={{
                flex:1, padding:"8px 10px", borderRadius:7,
                background:CARD, border:`1px solid ${BORDER}`,
                fontFamily:BODY, fontSize:"0.72rem", color:TX,
                outline:"none", caretColor:Y,
              }}
              onFocus={e => e.target.style.borderColor=Y+"88"}
              onBlur={e  => e.target.style.borderColor=BORDER}
            />
            <button
              onClick={() => { if (email) setSubscribed(true); }}
              style={{
                padding:"8px 12px", borderRadius:7, border:"none",
                background:Y, color:"#111",
                fontFamily:BODY, fontSize:"0.72rem", fontWeight:700,
                cursor:"pointer", flexShrink:0,
              }}
            >
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const [year,       setYear]       = useState(now.getFullYear());
  const [month,      setMonth]      = useState(now.getMonth() + 1);
  const [selectedDay,setSelectedDay]= useState(null);
  const [filters,    setFilters]    = useState({});

  const prevMonth = () => { setSelectedDay(null); if (month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const nextMonth = () => { setSelectedDay(null); if (month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday   = () => { setSelectedDay(null); setYear(now.getFullYear()); setMonth(now.getMonth()+1); };
  const handleLogout = async () => { await logout(); navigate("/"); };

  // Compute visible events
  const allEvents  = RAW_EVENTS.filter(e => e.y===year && e.m===month);
  const hasFilters = Object.values(filters).some(Boolean);
  const visible    = hasFilters
    ? allEvents.filter(ev => (filters.aiRec && ev.aiRec) || (ev.club && filters[ev.club]))
    : allEvents;

  // Calendar grid
  const fd    = firstDOW(year, month);
  const dim   = daysInMonth(year, month);
  const cells = [];
  for (let i=0;i<fd;i++) cells.push(null);
  for (let d=1;d<=dim;d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = now.getFullYear()===year && now.getMonth()+1===month;
  const todayDate = isCurrentMonth ? now.getDate() : -1;

  const dayEvents = selectedDay ? visible.filter(e => e.d===selectedDay) : [];

  return (
    <>
      {/* Load fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div style={{ display:"flex", height:"100vh", background:BG, overflow:"hidden" }}>
        <LeftSidebar onLogout={handleLogout} user={user}/>

        {/* Center + Right */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          <TopBar
            year={year} month={month}
            onPrev={prevMonth} onNext={nextMonth} onToday={goToday}
            filters={filters} setFilters={setFilters}
          />

          {/* Calendar grid + right panel */}
          <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
            {/* Grid */}
            <div style={{ flex:1, overflow:"auto", minWidth:0 }}>
              {/* Day headers */}
              <div style={{
                display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                borderBottom:`1px solid ${BORDER}`,
                borderRight:`1px solid ${BORDER}`,
                position:"sticky", top:0, background:BG, zIndex:10,
              }}>
                {DOW_SHORT.map(d => (
                  <div key={d} style={{
                    fontFamily:BODY, fontSize:"0.65rem", fontWeight:600,
                    color:TX2, textAlign:"center", letterSpacing:"1.5px",
                    padding:"10px 0",
                    borderLeft:`1px solid ${BORDER}`,
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Cells grid */}
              <div style={{
                display:"grid", gridTemplateColumns:"repeat(7,1fr)",
                borderLeft:`1px solid ${BORDER}`,
                borderTop:`1px solid ${BORDER}`,
              }}>
                {cells.map((day, idx) => {
                  if (!day) return (
                    <div key={`e-${idx}`} style={{
                      minHeight:96,
                      borderRight:`1px solid ${BORDER}`,
                      borderBottom:`1px solid ${BORDER}`,
                      background:"rgba(255,255,255,0.008)",
                    }}/>
                  );
                  const dayEvs = visible.filter(e => e.d===day);
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

            {/* Right panel — always rendered */}
            <RightPanel
              day={selectedDay} month={month} year={year}
              events={dayEvents}
              onClose={() => setSelectedDay(null)}
            />
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
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