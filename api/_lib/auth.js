import crypto from "node:crypto";

const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

// Простой подписанный токен (JWT-подобный). В проде можно заменить на полноценный JWT.
export function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifyToken(token) {
  if (!token) return null;
  const [body, sig] = String(token).split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (sig !== expected) return null;
  try { return JSON.parse(Buffer.from(body, "base64url").toString()); } catch { return null; }
}
export function getBearer(req) {
  const h = req.headers.authorization || req.headers.Authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}
