import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, authHeaders } from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const r = await fetch("/api/auth/me", { headers: authHeaders() });
        if (r.ok) { const d = await r.json(); setUser(d.user); }
        else setToken(null);
      } catch { /* backend offline — остаёмся гостем */ }
      finally { setLoading(false); }
    })();
  }, []);

  async function loginEmail(email) {
    const r = await fetch("/api/auth/email", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
    });
    if (!r.ok) throw new Error("auth_failed");
    const d = await r.json(); setToken(d.token); setUser(d.user); return d.user;
  }

  function loginVK() {
    const appId = import.meta.env.VITE_VK_APP_ID || "DEMO";
    const redirect = window.location.origin + "/auth/vk/callback";
    window.location.href =
      `https://oauth.vk.com/authorize?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=email&v=5.131`;
  }

  async function completeVK(code) {
    const r = await fetch("/api/auth/vk", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirectUri: window.location.origin + "/auth/vk/callback" }),
    });
    if (!r.ok) throw new Error("auth_failed");
    const d = await r.json(); setToken(d.token); setUser(d.user); return d.user;
  }

  function logout() { setToken(null); setUser(null); }

  return (
    <AuthContext.Provider value={{ user, loading, loginEmail, loginVK, completeVK, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
