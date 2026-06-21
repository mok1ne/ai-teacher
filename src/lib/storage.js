/* Тонкая обёртка над localStorage (приложение реальное, не артефакт — localStorage доступен). */
export const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
  },
};
export const todayKey = () => new Date().toISOString().slice(0, 10);
