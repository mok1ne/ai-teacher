/*
 * Локальное хранилище аккаунтов (браузер) — работает как запасной слой, если
 * серверный бэкенд недоступен или ещё не хранит запись (нет Redis). Благодаря
 * ему вход после регистрации работает всегда. В проде источник истины — сервер.
 * ДЕМО: пароль хранится в обфусцированном виде (не криптостойко).
 */
const KEY = "vs_accounts";
const all = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ } };

export const scramble = (pw) => {
  try { return btoa(unescape(encodeURIComponent("vs::" + pw))); } catch { return "vs::" + pw; }
};
export const normalizePhone = (p) => "+" + String(p || "").replace(/\D/g, "").replace(/^8/, "7");
export const emailId = (e) => "email:" + String(e || "").trim().toLowerCase();
export const phoneId = (p) => "phone:" + normalizePhone(p);
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
export const validPhone = (p) => String(p || "").replace(/\D/g, "").length >= 10;

export const accounts = {
  get: (id) => all()[id] || null,
  exists: (id) => !!all()[id],
  create: (acc) => { const a = all(); a[acc.id] = { twofa: false, ...acc }; save(a); return a[acc.id]; },
  verify: (id, pw) => { const r = all()[id]; return !!r && r.pw === scramble(pw); },
  setPassword: (id, pw) => { const a = all(); if (a[id]) { a[id].pw = scramble(pw); save(a); } },
  update: (id, patch) => { const a = all(); if (a[id]) { a[id] = { ...a[id], ...patch }; save(a); } },
};