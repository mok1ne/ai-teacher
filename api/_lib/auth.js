import crypto from "node:crypto";

// Секрет обязателен. В проде при отсутствии/дефолте — токены не выдаются и не
// принимаются (fail-closed), чтобы их нельзя было подделать.
const RAW = process.env.AUTH_SECRET || "";
const PROD = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const WEAK = ["", "dev-secret-change-me", "change-me-to-a-long-random-string"];
const strong = !WEAK.includes(RAW) && RAW.length >= 16;
const KEY = strong ? RAW : (PROD ? null : "dev-secret-only-for-localhost");
if (!strong && PROD) console.error("[auth] AUTH_SECRET не задан или слабый — аутентификация отключена. Задайте длинный случайный AUTH_SECRET.");

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // токен живёт 30 дней

export function signToken(payload) {
  if (!KEY) return null;
  const data = { ...payload, iat: Date.now(), exp: Date.now() + TTL_MS };
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = crypto.createHmac("sha256", KEY).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifyToken(token) {
  if (!KEY || !token) return null;
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", KEY).update(body).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null; // защита от timing-атак
  let p;
  try { p = JSON.parse(Buffer.from(body, "base64url").toString()); } catch { return null; }
  if (!p || (p.exp && p.exp < Date.now())) return null; // просроченный токен недействителен
  return p;
}
export function getBearer(req) {
  const h = req.headers.authorization || req.headers.Authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}
