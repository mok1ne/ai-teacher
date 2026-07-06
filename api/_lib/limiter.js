/*
 * Счётчик запросов, недельное окно (free — 10/неделю).
 * check() — проверить без списания; increment() — списать (вызываем ТОЛЬКО при
 * успешном ответе ИИ, чтобы сбой/плохой интернет не тратил лимит).
 * In-memory: не переживает холодный старт и не общий между инстансами —
 * для строгого лимита храните счётчик в Neon/Redis.
 */
const buckets = new Map();
function weekKey() {
  const d = new Date();
  const o = new Date(d.getFullYear(), 0, 1);
  const w = Math.ceil(((d - o) / 86400000 + o.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${w}`;
}
function current(key) {
  const b = buckets.get(key); const t = weekKey();
  return b && b.week === t ? b.count : 0;
}
export function check(key, limit) {
  const c = current(key);
  return { allowed: c < limit, remaining: Math.max(0, limit - c), limit };
}
export function increment(key) {
  buckets.set(key, { week: weekKey(), count: current(key) + 1 });
}
export function checkAndIncrement(key, limit) {
  const r = check(key, limit);
  if (!r.allowed) return { allowed: false, remaining: 0, limit };
  increment(key);
  return { allowed: true, remaining: r.remaining - 1, limit };
}
