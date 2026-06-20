import { C } from "../../theme";

export default function Button({ children, onClick, color = C.blue, variant = "solid", size = "md", style = {}, disabled }) {
  const pad = size === "lg" ? "14px 26px" : size === "sm" ? "8px 16px" : "11px 22px";
  const base = {
    fontSize: size === "lg" ? 16 : 14, fontWeight: 600, borderRadius: 12, padding: pad,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", transition: "all .15s",
    display: "inline-flex", alignItems: "center", gap: 8, opacity: disabled ? 0.55 : 1,
  };
  const skin = variant === "solid"
    ? { background: color, color: "#fff", boxShadow: `0 6px 16px -6px ${color}99` }
    : variant === "soft"
    ? { background: "#fff", color, border: `1.5px solid ${color}33` }
    : { background: "transparent", color, padding: 0, boxShadow: "none" };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...skin, ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
      {children}
    </button>
  );
}
