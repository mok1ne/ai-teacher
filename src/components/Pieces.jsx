import { C } from "../theme";

export function Pill({ Icon, title, color, bg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon size={20} style={{ color }} />
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.sub, lineHeight: 1.25, whiteSpace: "pre-line" }}>{title}</span>
    </div>
  );
}

export function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: C.purple, marginBottom: 6 }}>{eyebrow}</div>
      <h2 className="big-h2" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.01em" }}>{title}</h2>
    </div>
  );
}

export function Stat({ Icon, c, bg, value, label }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 18, display: "flex", alignItems: "center", gap: 13 }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: "grid", placeItems: "center" }}><Icon size={22} style={{ color: c }} /></div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: C.mut }}>{label}</div>
      </div>
    </div>
  );
}

export function LevelTabs({ value, onChange }) {
  const tabs = [["ege", "ЕГЭ"], ["oge", "ОГЭ"]];
  return (
    <div style={{ display: "inline-flex", background: "#EEF2F8", borderRadius: 12, padding: 4, gap: 4 }}>
      {tabs.map(([v, label]) => {
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)}
            style={{ border: "none", cursor: "pointer", padding: "8px 20px", borderRadius: 9, fontSize: 14, fontWeight: 700,
              background: active ? "#fff" : "transparent", color: active ? C.blue : C.mut,
              boxShadow: active ? "0 2px 8px -4px #0f172a55" : "none", transition: "all .15s" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}
