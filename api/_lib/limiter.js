/*
 * Счётчик запросов с недельным окном (для free — 10/неделю).
 * In-memory: сбрасывается при холодном старте и не общий между инстансами.
 * Для строгого продакшн-лимита храните счётчик в Neon/Redis по ключу недели.
 */
const buckets = new Map();
function weekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function checkAndIncrement(key, limit) {
  const t = weekKey();
  const b = buckets.get(key);
  const cur = b && b.week === t ? b.count : 0;
  if (cur >= limit) return { allowed: false, remaining: 0, limit };
  buckets.set(key, { week: t, count: cur + 1 });
  return { allowed: true, remaining: limit - (cur + 1), limit };
}
