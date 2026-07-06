import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const KEY = "vs_theme"; // "system" | "light" | "dark"

const systemDark = () => typeof window !== "undefined" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
const resolve = (pref) => (pref === "system" ? (systemDark() ? "dark" : "light") : pref);
function apply(mode) {
  document.documentElement.dataset.theme = mode;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = mode === "dark" ? "#0B1020" : "#ffffff";
}

export function ThemeProvider({ children }) {
  const [pref, setPrefState] = useState(() => { try { return localStorage.getItem(KEY) || "system"; } catch { return "system"; } });

  useEffect(() => {
    apply(resolve(pref));
    try { localStorage.setItem(KEY, pref); } catch { /* ignore */ }
    if (pref === "system") {
      const mq = matchMedia("(prefers-color-scheme: dark)");
      const h = () => apply(resolve("system"));
      mq.addEventListener?.("change", h);
      return () => mq.removeEventListener?.("change", h);
    }
  }, [pref]);

  return <ThemeContext.Provider value={{ pref, setPref: setPrefState, resolved: resolve(pref) }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
