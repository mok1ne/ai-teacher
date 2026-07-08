/*
 * Простой антибрутфорс/антиспам по ключу (IP+действие), скользящее окно.
 * In-memory: на serverless не общий между инстансами — это дополнительный слой,
 * не единственная защита. Для строгого лимита используйте Redis/Neon.
 */
const hits = new Map();

export function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
}
export function rateLimit(key, { max = 10, windowMs = 60000 } = {}) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return false; }
  arr.push(now); hits.set(key, arr);
  if (hits.size > 5000) { for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k); }
  return true;
}
