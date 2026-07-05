import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, authHeaders } from "../lib/auth";
import { accounts, scramble, emailId, phoneId, normalizePhone, validEmail, validPhone } from "../lib/accounts";

const AuthContext = createContext(null);
const PROFILE_KEY = "vs_profile";

const cacheProfile = (u) => { try { u ? localStorage.setItem(PROFILE_KEY, JSON.stringify(u)) : localStorage.removeItem(PROFILE_KEY); } catch { /* ignore */ } };
const readCache = () => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch { return null; } };
const isDemoToken = (t) => typeof t === "string" && t.startsWith("demo.");

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json", ...(auth ? authHeaders() : {}) };
  let r;
  try { r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("network"); }
  let data = {}; try { data = await r.json(); } catch { /* пусто */ }
  if (!r.ok) throw new Error(data.error || "request_failed");
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      const cached = readCache();
      if (cached) setUser(cached);
      // Локальная (демо) сессия — не дёргаем сервер, чтобы не разлогинить.
      if (isDemoToken(token)) { setLoading(false); return; }
      try {
        const d = await api("/api/auth?action=me", { auth: true });
        setUser(d.user); cacheProfile(d.user);
      } catch (e) {
        if (e.message === "unauthorized") { setToken(null); cacheProfile(null); setUser(null); }
      } finally { setLoading(false); }
    })();
  }, []);

  const applyServer = (d) => { setToken(d.token); setUser(d.user); cacheProfile(d.user); return d.user; };
  const localSession = (acc) => {
    const token = "demo." + btoa(unescape(encodeURIComponent(acc.id))).slice(0, 40);
    setToken(token);
    const u = { id: acc.id, email: acc.email || null, phone: acc.phone || null, name: acc.name, age: acc.age, plan: "free", twofa: !!acc.twofa, provider: acc.provider };
    setUser(u); cacheProfile(u); return u;
  };

  // --- Регистрация по e-mail ---
  async function registerEmail(email, password, name, age) {
    if (!validEmail(email)) throw new Error("invalid_email");
    if ((password || "").length < 6) throw new Error("weak_password");
    const id = emailId(email);
    const mail = email.trim().toLowerCase();
    try {
      const d = await api("/api/auth?action=register", { method: "POST", body: { email: mail, password, name, age } });
      accounts.create({ id, provider: "email", email: mail, name, age, pw: scramble(password) });
      return applyServer(d);
    } catch (e) {
      if (e.message === "network" || e.message === "request_failed") {
        if (accounts.exists(id)) throw new Error("exists");
        return localSession(accounts.create({ id, provider: "email", email: mail, name, age, pw: scramble(password) }));
      }
      throw e; // exists / invalid_age и т.п.
    }
  }

  // --- Вход по e-mail ---
  async function loginEmail(email, password) {
    if (!validEmail(email)) throw new Error("invalid_email");
    const id = emailId(email);
    try {
      return applyServer(await api("/api/auth?action=login", { method: "POST", body: { email: email.trim().toLowerCase(), password } }));
    } catch (e) {
      if (["network", "request_failed", "bad_credentials"].includes(e.message) && accounts.verify(id, password)) {
        return localSession(accounts.get(id));
      }
      throw new Error(e.message === "bad_credentials" ? "bad_credentials" : e.message);
    }
  }

  // --- Восстановление пароля через код на почту ---
  // Демо: код генерируется и возвращается для показа. В проде — отправка письма
  // с кодом через провайдер (Resend/SMTP) и хранение кода на сервере (Neon).
  const RKEY = "vs_reset";
  const readReset = () => { try { return JSON.parse(localStorage.getItem(RKEY) || "{}"); } catch { return {}; } };
  const writeReset = (v) => { try { localStorage.setItem(RKEY, JSON.stringify(v)); } catch { /* ignore */ } };

  async function requestResetCode(email) {
    if (!validEmail(email)) throw new Error("invalid_email");
    const mail = email.trim().toLowerCase();
    try {
      const d = await api("/api/auth?action=forgot-request", { method: "POST", body: { email: mail } });
      return { demoCode: d.devCode || null };
    } catch (e) {
      if (e.message !== "network" && e.message !== "request_failed") throw e;
      // локальный фолбэк (оффлайн/без бэкенда)
      const id = emailId(mail);
      if (!accounts.exists(id)) throw new Error("no_account");
      const code = String(Math.floor(1000 + Math.random() * 9000));
      const all = readReset(); all[id] = { code, exp: Date.now() + 10 * 60 * 1000 }; writeReset(all);
      return { demoCode: code };
    }
  }

  async function resetPasswordWithCode(email, code, newPassword) {
    if (!validEmail(email)) throw new Error("invalid_email");
    if ((newPassword || "").length < 6) throw new Error("weak_password");
    const mail = email.trim().toLowerCase();
    const id = emailId(mail);
    try {
      const d = await api("/api/auth?action=forgot-verify", { method: "POST", body: { email: mail, code, newPassword } });
      if (accounts.exists(id)) accounts.setPassword(id, newPassword); // синхронизируем локальную копию
      return applyServer(d); // автоматический вход
    } catch (e) {
      if (e.message !== "network" && e.message !== "request_failed") throw e;
      const rec = readReset()[id];
      if (!rec || rec.exp < Date.now() || rec.code !== String(code || "").trim()) throw new Error("bad_code");
      if (!accounts.exists(id)) throw new Error("no_account");
      accounts.setPassword(id, newPassword);
      const all = readReset(); delete all[id]; writeReset(all);
      return localSession(accounts.get(id));
    }
  }

  // --- Вход/регистрация по номеру телефона (демо: код из 4 цифр) ---
  const phoneExists = (phone) => accounts.exists(phoneId(phone));
  async function requestPhoneCode(phone) {
    if (!validPhone(phone)) throw new Error("invalid_phone");
    // прод: отправить СМС с кодом через российского провайдера. В демо — любой код 0000–9999.
    return true;
  }
  async function phoneAuth(phone, code, name, age) {
    if (!validPhone(phone)) throw new Error("invalid_phone");
    if (!/^\d{4}$/.test(String(code || ""))) throw new Error("bad_code");
    const id = phoneId(phone);
    if (accounts.exists(id)) return localSession(accounts.get(id));
    if (!name || !name.trim()) throw new Error("needs_profile");
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) throw new Error("invalid_age");
    return localSession(accounts.create({ id, provider: "phone", phone: normalizePhone(phone), name: name.trim(), age: a }));
  }

  // --- VK ID ---
  function loginVK() {
    const appId = import.meta.env.VITE_VK_APP_ID || "DEMO";
    const redirect = window.location.origin + "/auth/vk/callback";
    window.location.href =
      `https://oauth.vk.com/authorize?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=email&v=5.131`;
  }
  async function completeVK(code) {
    return applyServer(await api("/api/auth?action=vk", { method: "POST", body: { code, redirectUri: window.location.origin + "/auth/vk/callback" } }));
  }

  // --- Настройки (сервер + локальный фолбэк) ---
  async function updateName(name) {
    if (!name || !name.trim()) throw new Error("empty_name");
    const id = user.id; const nm = name.trim();
    if (accounts.exists(id)) accounts.update(id, { name: nm });
    try { await api("/api/account?action=name", { method: "POST", auth: true, body: { name: nm } }); } catch { /* локально уже применили */ }
    const u = { ...user, name: nm }; setUser(u); cacheProfile(u);
  }
  async function changePassword(oldPassword, newPassword) {
    if ((newPassword || "").length < 6) throw new Error("weak_password");
    const id = user.id;
    if (accounts.exists(id)) {
      if (!accounts.verify(id, oldPassword)) throw new Error("bad_password");
      accounts.setPassword(id, newPassword);
      try { await api("/api/account?action=password", { method: "POST", auth: true, body: { oldPassword, newPassword } }); } catch { /* локально ок */ }
      return;
    }
    await api("/api/account?action=password", { method: "POST", auth: true, body: { oldPassword, newPassword } });
  }
  async function setTwoFactor(enabled) {
    const id = user.id;
    if (accounts.exists(id)) accounts.update(id, { twofa: !!enabled });
    try { await api("/api/account?action=twofa", { method: "POST", auth: true, body: { enabled } }); } catch { /* локально ок */ }
    const u = { ...user, twofa: !!enabled }; setUser(u); cacheProfile(u);
  }

  function logout() { setToken(null); cacheProfile(null); setUser(null); }

  return (
    <AuthContext.Provider value={{
      user, loading,
      registerEmail, loginEmail, requestResetCode, resetPasswordWithCode,
      phoneExists, requestPhoneCode, phoneAuth,
      loginVK, completeVK, logout,
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
