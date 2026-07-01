import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, authHeaders } from "../lib/auth";

const AuthContext = createContext(null);
const PROFILE_KEY = "vs_profile";
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());

function cacheProfile(u) {
  try { u ? localStorage.setItem(PROFILE_KEY, JSON.stringify(u)) : localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ }
}
function readCache() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; }
}

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) };
  let r;
  try { r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("network"); }
  let data = {};
  try { data = await r.json(); } catch { /* пусто */ }
  if (!r.ok) throw new Error(data.error || "request_failed");
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      const cached = readCache();
      if (cached) setUser(cached);
      try {
        const d = await api("/api/auth/me", { auth: true });
        setUser(d.user); cacheProfile(d.user);
      } catch (e) {
        if (e.message === "unauthorized") { setToken(null); cacheProfile(null); setUser(null); }
        // network — оставляем кэш
      } finally { setLoading(false); }
    })();
  }, []);

  function apply(d) { setToken(d.token); setUser(d.user); cacheProfile(d.user); return d.user; }

  // Регистрация: e-mail + пароль, затем имя и возраст.
  async function registerEmail(email, password, name, age) {
    if (!validEmail(email)) throw new Error("invalid_email");
    if ((password || "").length < 6) throw new Error("weak_password");
    return apply(await api("/api/auth/register", { method: "POST", body: { email: email.trim(), password, name, age } }));
  }

  // Вход по почте — только с паролем.
  async function loginEmail(email, password) {
    if (!validEmail(email)) throw new Error("invalid_email");
    return apply(await api("/api/auth/login", { method: "POST", body: { email: email.trim(), password } }));
  }

  // VK ID — разрешённый российский сервис авторизации.
  function loginVK() {
    const appId = import.meta.env.VITE_VK_APP_ID || "DEMO";
    const redirect = window.location.origin + "/auth/vk/callback";
    window.location.href =
      `https://oauth.vk.com/authorize?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=email&v=5.131`;
  }
  async function completeVK(code) {
    const d = await api("/api/auth/vk", { method: "POST", body: { code, redirectUri: window.location.origin + "/auth/vk/callback" } });
    return apply(d);
  }

  // --- Настройки ---
  async function updateName(name) {
    if (!name || !name.trim()) throw new Error("empty_name");
    const d = await api("/api/account/name", { method: "POST", auth: true, body: { name: name.trim() } });
    setUser(d.user); cacheProfile(d.user);
  }
  async function changePassword(oldPassword, newPassword) {
    if ((newPassword || "").length < 6) throw new Error("weak_password");
    await api("/api/account/password", { method: "POST", auth: true, body: { oldPassword, newPassword } });
  }
  async function setTwoFactor(enabled) {
    const d = await api("/api/account/twofa", { method: "POST", auth: true, body: { enabled } });
    setUser(d.user); cacheProfile(d.user);
  }

  function logout() { setToken(null); cacheProfile(null); setUser(null); }

  return (
    <AuthContext.Provider value={{
      user, loading,
      registerEmail, loginEmail, loginVK, completeVK, logout,
      updateName, changePassword, setTwoFactor,
      isEmailUser: user?.provider === "email",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
