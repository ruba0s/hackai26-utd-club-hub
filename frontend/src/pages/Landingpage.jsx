import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import clubhubLogo from "../assets/clubhubLogo.png";

const Y    = "#FDFDA3";
const OR   = "#E8540A";
const BG   = "#080808";
const BR   = "#2a2a2a";
const MU   = "#a4a2a2";
const FONT = "'Courier New', Courier, monospace";

function Squiggle({ width = 108 }) {
  return (
    <svg width={width} height={10} viewBox={`0 0 ${width} 10`} fill="none"
      style={{ display: "block", marginTop: 2 }}>
      <path
        d={`M2 6 Q${width*0.15} 2 ${width*0.3} 6 Q${width*0.45} 10 ${width*0.6} 5 Q${width*0.75} 2 ${width*0.9} 6 Q${width*0.95} 7 ${width-2} 5`}
        stroke={Y} strokeWidth="2.8" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

export default function LandingPage() {
  const navigate        = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.onboardingComplete ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div style={{
      position: "relative", width: "100vw", height: "100vh",
      background: BG, overflow: "hidden",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>

      {/* Ambient glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position:"absolute", left:"20%",  top:"65%", width:520, height:520, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(140,60,10,0.55)",  filter:"blur(80px)" }}/>
        <div style={{ position:"absolute", left:"75%",  top:"40%", width:360, height:360, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(100,105,18,0.35)", filter:"blur(40px)" }}/>
        <div style={{ position:"absolute", left:"85%",  top:"40%", width:360, height:360, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(100,105,18,0.35)", filter:"blur(40px)" }}/>

        <div style={{ position:"absolute", left:"55%",  top:"80%", width:260, height:260, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(130,50,10,0.28)",  filter:"blur(90px)"  }}/>
      </div>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 60,
        background: "rgba(8,8,8,0.85)",
        borderBottom: `1px solid ${BR}`,
        backdropFilter: "blur(10px)",
      }}>
        <img src={clubhubLogo} alt="ClubHub" style={{ height: 36, width: "auto", display: "block" }} />

        <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {["Calendar", "About", "Contact"].map(link => (
            <a key={link} href="#" style={{
              fontFamily: FONT, fontSize: "0.92rem", color: "#ccc",
              textDecoration: "none", letterSpacing: "0.3px",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
            >
              {link}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "8px 22px", borderRadius: 8,
              border: `1px solid #444`,
              background: "rgba(255,255,255,0.07)", color: "#ddd",
              fontFamily: FONT, fontSize: "0.88rem", fontWeight: 500,
              cursor: "pointer", letterSpacing: "0.2px", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#666"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.color = "#ddd"; }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              padding: "8px 22px", borderRadius: 8, border: "none",
              background: Y, color: "#111",
              fontFamily: FONT, fontSize: "0.88rem", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ffffb0"}
            onMouseLeave={e => e.currentTarget.style.background = Y}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 24, padding: "0 24px",
        animation: "fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) forwards",
      }}>
        {/* Tag pill */}
        <div style={{
          border: `1px solid ${Y}`,
          borderRadius: 4, padding: "5px 18px",
          fontFamily: FONT, fontSize: "0.72rem", color: Y,
          letterSpacing: "1.8px",
        }}>
          remark your calendar
        </div>

        {/* Headline */}
        <div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.06,
            letterSpacing: "-2.5px",
            marginBottom: 8,
          }}>
            Never miss another<br />event again.
          </h1>
        </div>

        {/* Subheadings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1rem", color: "#a4a2a2", maxWidth: 520, lineHeight: 1.8, letterSpacing: "0.2px" }}>
            300+ student orgs. One personalized calendar,<br />AI-matched to your interests.
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "1rem", color: "#a4a2a2", maxWidth: 520, lineHeight: 1.8, letterSpacing: "0.2px" }}>
            Get weekly updates on your fav orgs and recommended events on the go.
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/signup")}
            style={{
              padding: "15px 44px", borderRadius: 10, border: "none",
              background: Y, color: "#111",
              fontFamily: FONT, fontSize: "1rem", fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#ffffb0"}
            onMouseLeave={e => e.currentTarget.style.background = Y}
          >
            Get Started →
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "15px 44px", borderRadius: 10,
              border: `2px solid ${BR}`,
              background: "transparent", color: "#ccc",
              fontFamily: FONT, fontSize: "1rem", fontWeight: 500,
              cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BR;    e.currentTarget.style.color = "#ccc"; }}
          >
            Login
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Mono:ital,wght@0,400;0,500&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </div>
  );
}