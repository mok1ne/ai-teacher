/*
 * Дневной счётчик запросов. ВНИМАНИЕ: in-memory — сбрасывается при «холодном старте»
 * и не общий между инстансами. Для продакшена замените на Upstash Redis:
 *   const r = await fetch(`${UPSTASH_URL}/incr/${key}`, { headers:{Authorization:`Bearer ${UPSTASH_TOKEN}`}});
 *   // + установить TTL до конца суток через EXPIRE.
 */
const buckets = new Map();
const today = () => new Date().toISOString().slice(0, 10);

export function checkAndIncrement(key, limit) {
  const t = today();
  const b = buckets.get(key);
  const cur = b && b.date === t ? b.count : 0;
  if (cur >= limit) return { allowed: false, remaining: 0, limit };
  buckets.set(key, { date: t, count: cur + 1 });
  return { allowed: true, remaining: limit - (cur + 1), limit };
}
