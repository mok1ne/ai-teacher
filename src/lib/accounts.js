/*
 * ДЕМО-хранилище аккаунтов в localStorage — только для прототипа.
 * В продакшене регистрация/пароли/2FA должны жить на сервере
 * (пароли — хэш bcrypt/argon2, 2FA — TOTP/SMS), а не в браузере.
 */
const KEY = "vs_accounts";

function all() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function save(a) { localStorage.setItem(KEY, JSON.stringify(a)); }

// ДЕМО-обфускация пароля (НЕ криптостойкая). В проде — хэш на сервере.
function scramble(pw) {
  try { return btoa(unescape(encodeURIComponent("vs::" + pw))); } catch { return "vs::" + pw; }
}

// Новый закон РФ: ограничение входа по адресам Gmail. Блокируем @gmail.com.
export function isBlockedEmail(email) {
  return /@(gmail|googlemail)\.com\s*$/i.test((email || "").trim());
}

export function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

export const accounts = {
  exists: (email) => !!all()[email.toLowerCase()],
  get: (email) => all()[email.toLowerCase()] || null,
  create: (email, pw, name, age) => {
    const a = all();
    a[email.toLowerCase()] = { pw: scramble(pw), name, age, twofa: false };
    save(a);
  },
  verify: (email, pw) => {
    const r = all()[email.toLowerCase()];
    return !!r && r.pw === scramble(pw);
  },
  update: (email, patch) => {
    const a = all(); const e = email.toLowerCase();
    if (a[e]) { a[e] = { ...a[e], ...patch }; save(a); }
  },
  setPassword: (email, pw) => {
    const a = all(); const e = email.toLowerCase();
    if (a[e]) { a[e].pw = scramble(pw); save(a); }
  },
};
