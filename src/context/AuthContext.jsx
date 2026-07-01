import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, authHeaders } from "../lib/auth";
import { accounts, isBlockedEmail, validEmail } from "../lib/accounts";

const AuthContext = createContext(null);
const PROFILE_KEY = "vs_profile";

function saveProfile(u) {
  try { if (u) localStorage.setItem(PROFILE_KEY, JSON.stringify(u)); else localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ }
}
function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; }
}

// Токен сессии: через API, а если бэкенд недоступен (превью без vercel dev) —
// локальный демо-токен, чтобы прототип работал в браузере.
async function issueToken(email, name) {
  try {
    const r = await fetch("/api/auth/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (r.ok) { const d = await r.json(); return d.token; }
  } catch { /* оффлайн */ }
  return "demo." + btoa(unescape(encodeURIComponent(email))).slice(0, 24);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      const local = loadProfile();
      if (local) { setUser(local); setLoading(false); return; }
      try {
        const r = await fetch("/api/auth/me", { headers: authHeaders() });
        if (r.ok) { const d = await r.json(); setUser(d.user); saveProfile(d.user); }
        else setToken(null);
      } catch { /* backend offline */ }
      finally { setLoading(false); }
    })();
  }, []);

  function commit(u) { setToken(u._token); const c = { ...u }; delete c._token; setUser(c); saveProfile(c); return c; }

  // Регистрация: e-mail + пароль, затем имя и возраст.
  async function registerEmail(email, password, name, age) {
    if (!validEmail(email)) throw new Error("invalid_email");
    if (isBlockedEmail(email)) throw new Error("gmail_blocked");
    if ((password || "").length < 6) throw new Error("weak_password");
    if (accounts.exists(email)) throw new Error("exists");
    accounts.create(email, password, name, age);
    const _token = await issueToken(email, name);
    return commit({ id: "email:" + email.toLowerCase(), email, name, age, plan: "free", twofa: false, _token });
  }

  // Вход по почте — только с паролем.
  async function loginEmail(email, password) {
    if (!validEmail(email)) throw new Error("invalid_email");
    if (isBlockedEmail(email)) throw new Error("gmail_blocked");
    if (!accounts.exists(email)) throw new Error("no_account");
    if (!accounts.verify(email, password)) throw new Error("bad_password");
    const acc = accounts.get(email);
    const _token = await issueToken(email, acc.name);
    return commit({ id: "email:" + email.toLowerCase(), email, name: acc.name, age: acc.age, plan: "free", twofa: acc.twofa, _token });
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
    const d = await r.json(); setToken(d.token); setUser(d.user); saveProfile(d.user); return d.user;
  }

  // --- Настройки профиля ---
  function updateName(name) {
    if (!name || !name.trim()) throw new Error("empty_name");
    if (user?.email) accounts.update(user.email, { name: name.trim() });
    const u = { ...user, name: name.trim() }; setUser(u); saveProfile(u);
  }
  function changePassword(oldPw, newPw) {
    if (!user?.email) throw new Error("no_email_account");
    if (!accounts.verify(user.email, oldPw)) throw new Error("bad_password");
    if ((newPw || "").length < 6) throw new Error("weak_password");
    accounts.setPassword(user.email, newPw);
  }
  function setTwoFactor(enabled) {
    if (user?.email) accounts.update(user.email, { twofa: !!enabled });
    const u = { ...user, twofa: !!enabled }; setUser(u); saveProfile(u);
  }

  function logout() { setToken(null); saveProfile(null); setUser(null); }

  return (
    <AuthContext.Provider value={{
      user, loading,
      registerEmail, loginEmail, loginVK, completeVK, logout,
      updateName, changePassword, setTwoFactor,
      isEmailUser: !!user?.email,
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
