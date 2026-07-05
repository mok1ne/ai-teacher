import { sql, useDb } from "./db.js";

const mem = new Map();
const TTL_MS = 10 * 60 * 1000;

export async function setCode(email, code) {
  const mail = String(email).trim().toLowerCase();
  const exp = Date.now() + TTL_MS;
  if (!useDb) { mem.set(mail, { code, exp }); return; }
  await sql`
    INSERT INTO reset_codes (email, code, expires_at)
    VALUES (${mail}, ${code}, to_timestamp(${exp / 1000}))
    ON CONFLICT (email) DO UPDATE SET code = ${code}, expires_at = to_timestamp(${exp / 1000})`;
}
export async function checkCode(email, code) {
  const mail = String(email).trim().toLowerCase();
  if (!useDb) { const r = mem.get(mail); return !!r && r.exp > Date.now() && r.code === String(code); }
  const r = await sql`SELECT code, expires_at FROM reset_codes WHERE email = ${mail}`;
  if (!r[0]) return false;
  return r[0].code === String(code) && new Date(r[0].expires_at).getTime() > Date.now();
}
export async function clearCode(email) {
  const mail = String(email).trim().toLowerCase();
  if (!useDb) { mem.delete(mail); return; }
  await sql`DELETE FROM reset_codes WHERE email = ${mail}`;
}
