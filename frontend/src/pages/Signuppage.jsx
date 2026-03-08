import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Y    = "#FDFDA3";
const BG   = "#080808";
const CARD = "#252525";
const BR   = "#3a3a3a";
const INP  = "#1e1e1e";
const MU   = "#6b6b6b";
const FONT = "'Courier New', Courier, monospace";

function Squiggle({ width = 108 }) {
  return (
    <svg width={width} height={10} viewBox={`0 0 ${width} 10`} fill="none" style={{ display:"block", marginTop:2 }}>
      <path d={`M2 6 Q${width*0.15} 2 ${width*0.3} 6 Q${width*0.45} 10 ${width*0.6} 5 Q${width*0.75} 2 ${width*0.9} 6 Q${width*0.95} 7 ${width-2} 5`}
        stroke={Y} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function Field({ label, type="text", value, onChange, onKeyDown }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontFamily:FONT, fontSize:"0.82rem", color:"#ccc" }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}
        style={{
          background:INP, border:`1.5px solid ${BR}`, borderRadius:8,
          padding:"14px 16px", fontFamily:FONT, fontSize:"0.9rem",
          color:"#fff", outline:"none", caretColor:Y, transition:"border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = Y}
        onBlur={e  => e.target.style.borderColor = BR}
      />
    </div>
  );
}

const getFriendlyError = (code) => {
  switch (code) {
    case "auth/invalid-email":        return "Invalid email address.";
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/weak-password":        return "Password must be at least 6 characters.";
    default:                          return "Something went wrong. Please try again.";
  }
};

export default function SignupPage() {
  const navigate          = useNavigate();
  const { user, loading, signUp } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);

  // Already logged in — redirect away
  useEffect(() => {
    if (!loading && user) {
      navigate(user.onboardingComplete ? "/dashboard" : "/onboarding", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async () => {
    setError("");
    if (!name || !email || !password || !confirm) return setError("Please fill in all fields.");
    if (password !== confirm) return setError("Passwords don't match.");
    if (password.length < 6)  return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      await signUp(email, password, name);
      navigate("/onboarding");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setBusy(false);
    }
  };

  const onKey = e => { if (e.key === "Enter") handleSubmit(); };

  if (loading) return null;

  return (
    <div style={{
      position:"relative", width:"100vw", minHeight:"100vh",
      background:BG, display:"flex", alignItems:"center",
      justifyContent:"center", padding:"32px 16px",
    }}>
      {/* Glows */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
        <div style={{ position:"absolute", left:"18%", top:"68%", width:480, height:480, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(140,60,10,0.5)",  filter:"blur(110px)" }}/>
        <div style={{ position:"absolute", left:"78%", top:"38%", width:340, height:340, transform:"translate(-50%,-50%)", borderRadius:"50%", background:"rgba(100,105,18,0.32)",filter:"blur(100px)" }}/>
      </div>

      {/* Logo */}
      <div style={{ position:"fixed", top:22, left:28, zIndex:50, cursor:"pointer" }} onClick={() => navigate("/")}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ fontFamily:FONT, fontSize:18, fontWeight:700, color:"#fff" }}>ClubHub</span>
          <span style={{ fontSize:16 }}>🖊️</span>
        </div>
        <Squiggle />
      </div>

      {/* Card */}
      <div style={{
        position:"relative", zIndex:10,
        background:CARD, borderRadius:16,
        padding:"36px 40px", width:"100%", maxWidth:460,
        display:"flex", flexDirection:"column", gap:18,
        animation:"fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) forwards",
      }}>
        <h1 style={{ fontFamily:FONT, fontSize:"1.8rem", fontWeight:700, color:"#fff", textAlign:"center", letterSpacing:"-0.5px" }}>
          Sign up
        </h1>

        <Field label="Name"             type="text"     value={name}     onChange={e=>setName(e.target.value)}     onKeyDown={onKey}/>
        <Field label="Email"            type="email"    value={email}    onChange={e=>setEmail(e.target.value)}    onKeyDown={onKey}/>
        <Field label="Password"         type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={onKey}/>
        <Field label="Confirm Password" type="password" value={confirm}  onChange={e=>setConfirm(e.target.value)}  onKeyDown={onKey}/>

        {error && <p style={{ fontFamily:FONT, fontSize:"0.8rem", color:"#ff6b6b", textAlign:"center" }}>{error}</p>}

        <button
          onClick={handleSubmit} disabled={busy}
          style={{
            width:"100%", padding:"16px 0", borderRadius:10, border:"none",
            background: busy ? "rgba(253,253,163,0.45)" : Y,
            color:"#111", fontFamily:FONT, fontSize:"1rem", fontWeight:700,
            cursor: busy ? "not-allowed" : "pointer", transition:"all 0.15s",
          }}
        >
          {busy ? "Creating account…" : "Get Started"}
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:1, background:BR }}/>
          <span style={{ fontFamily:FONT, fontSize:"0.75rem", color:MU }}>or</span>
          <div style={{ flex:1, height:1, background:BR }}/>
        </div>

        {/* Google placeholder — no-op until backend ready */}
        <button
          disabled
          style={{
            width:"100%", padding:"14px 0", borderRadius:10,
            border:`1.5px solid ${BR}`, background:"#1c1c1c",
            display:"flex", alignItems:"center", justifyContent:"center", gap:12,
            cursor:"not-allowed", opacity:0.5,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span style={{ fontFamily:FONT, fontSize:"0.9rem", color:"#ccc" }}>Login with Google</span>
        </button>

        <p style={{ fontFamily:FONT, fontSize:"0.8rem", color:MU, textAlign:"center" }}>
          Have an account?{" "}
          <button onClick={() => navigate("/login")}
            style={{ background:"none", border:"none", fontFamily:FONT, fontSize:"0.8rem", color:Y, cursor:"pointer", textDecoration:"underline" }}>
            Login Here!
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:#2a2a2a; }
      `}</style>
    </div>
  );
}