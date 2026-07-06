import { C } from "../theme";

export default function HeroArt() {
  const books = [
    { t: "ЕГЭ", c: C.purple, w: 188 },
    { t: "ОГЭ", c: C.blue, w: 205 },
    { t: "МАТЕМАТИКА", c: "#fff", tc: C.ink, w: 222, b: true },
    { t: "РУССКИЙ ЯЗЫК", c: "#fff", tc: C.ink, w: 238, b: true },
    { t: "ОБЩЕСТВОЗНАНИЕ", c: "#fff", tc: C.ink, w: 255, b: true },
  ];
  return (
    <div className="hero-art" style={{ position: "relative", borderRadius: 28, padding: "30px 26px",
      background: "linear-gradient(135deg,#EAF1FF 0%,#F1ECFE 100%)", overflow: "hidden", minHeight: 320 }}>
      <div style={{ position: "absolute", top: -40, right: -30, width: 160, height: 160, borderRadius: "50%", background: "#DCE6FF", opacity: .6 }} />
      <div style={{ position: "absolute", bottom: -50, left: -20, width: 130, height: 130, borderRadius: "50%", background: "#E6DCFF", opacity: .5 }} />
      <div style={{ position: "relative", display: "flex", gap: 22, alignItems: "flex-end", justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "center" }}>
          {books.map((b, i) => (
            <div key={i} style={{ width: b.w, maxWidth: "100%", height: 34, background: b.c, borderRadius: 7,
              border: b.b ? `1.5px solid ${C.line}` : "none", display: "grid", placeItems: "center",
              boxShadow: "0 3px 8px -4px #0f172a55", color: b.tc || "#fff", fontWeight: 800, fontSize: 12.5, letterSpacing: .5 }}>
              {b.t}
            </div>
          ))}
        </div>
        <div style={{ width: 196, maxWidth: "100%", background: C.card, borderRadius: 14, boxShadow: "0 14px 34px -16px #0f172a55",
          border: `1px solid ${C.line}`, overflow: "hidden", alignSelf: "center" }}>
          <div style={{ background: C.track, padding: "7px 10px", display: "flex", gap: 5 }}>
            {["#F87171", "#FBBF24", "#34D399"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>f(x) = x² − 6x + 9</div>
            <svg viewBox="0 0 160 80" style={{ width: "100%", marginTop: 8 }}>
              <line x1="10" y1="70" x2="150" y2="70" stroke={C.line} strokeWidth="1.5" />
              <line x1="80" y1="6" x2="80" y2="74" stroke={C.line} strokeWidth="1.5" />
              <path d="M30 14 Q80 96 130 14" fill="none" stroke={C.blue} strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
