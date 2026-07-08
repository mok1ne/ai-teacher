import { sql, useDb } from "./db.js";

const mem = new Map();
const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5; // после 5 неверных попыток код блокируется

export async function setCode(email, code) {
  const mail = String(email).trim().toLowerCase();
  const exp = Date.now() + TTL_MS;
  if (!useDb) { mem.set(mail, { code, exp, attempts: 0 }); return; }
  await sql`
    INSERT INTO reset_codes (email, code, expires_at, attempts)
    VALUES (${mail}, ${code}, to_timestamp(${exp / 1000}), 0)
    ON CONFLICT (email) DO UPDATE SET code = ${code}, expires_at = to_timestamp(${exp / 1000}), attempts = 0`;
}

export async function checkCode(email, code) {
  const mail = String(email).trim().toLowerCase();
  const given = String(code || "");
  if (!useDb) {
    const r = mem.get(mail);
    if (!r || r.exp < Date.now() || r.attempts >= MAX_ATTEMPTS) return false;
    if (r.code === given) return true;
    r.attempts += 1; mem.set(mail, r); return false;
  }
  const r = await sql`SELECT code, expires_at, attempts FROM reset_codes WHERE email = ${mail}`;
  if (!r[0]) return false;
  const expired = new Date(r[0].expires_at).getTime() < Date.now();
  if (expired || (r[0].attempts || 0) >= MAX_ATTEMPTS) return false;
  if (r[0].code === given) return true;
  await sql`UPDATE reset_codes SET attempts = COALESCE(attempts, 0) + 1 WHERE email = ${mail}`;
  return false;
}

export async function clearCode(email) {
  const mail = String(email).trim().toLowerCase();
  if (!useDb) { mem.delete(mail); return; }
  await sql`DELETE FROM reset_codes WHERE email = ${mail}`;
}
