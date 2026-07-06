import { sql, useDb } from "./db.js";

const mem = new Map(); // fallback для разработки без БД

const toUser = (r) => r && ({
  id: r.id, email: r.email, phone: r.phone, name: r.name, age: r.age,
  plan: r.plan, twofa: r.twofa, provider: r.provider, level: r.level || "ege",
  passwordHash: r.password_hash, createdAt: r.created_at,
});

export async function getUserById(id) {
  if (!id) return null;
  if (!useDb) return mem.get(id) || null;
  const r = await sql`SELECT * FROM users WHERE id = ${id}`;
  return toUser(r[0]);
}
export async function getUserByEmail(email) {
  if (!email) return null;
  const mail = String(email).trim().toLowerCase();
  if (!useDb) { for (const u of mem.values()) if (u.email === mail) return u; return null; }
  const r = await sql`SELECT * FROM users WHERE email = ${mail}`;
  return toUser(r[0]);
}
export async function getUserByPhone(phone) {
  if (!phone) return null;
  if (!useDb) { for (const u of mem.values()) if (u.phone === phone) return u; return null; }
  const r = await sql`SELECT * FROM users WHERE phone = ${phone}`;
  return toUser(r[0]);
}
export async function createUser(u) {
  if (!useDb) { mem.set(u.id, u); return u; }
  await sql`
    INSERT INTO users (id, email, phone, name, age, plan, twofa, provider, level, password_hash)
    VALUES (${u.id}, ${u.email || null}, ${u.phone || null}, ${u.name}, ${u.age || null},
            ${u.plan || "free"}, ${u.twofa || false}, ${u.provider}, ${u.level || "ege"}, ${u.passwordHash || null})`;
  return u;
}
export async function patchUserById(id, patch) {
  const cur = await getUserById(id);
  if (!cur) return null;
  const n = { ...cur, ...patch };
  if (!useDb) { mem.set(id, n); return n; }
  await sql`
    UPDATE users SET name = ${n.name}, age = ${n.age || null}, plan = ${n.plan},
      twofa = ${n.twofa}, phone = ${n.phone || null}, level = ${n.level || "ege"},
      password_hash = ${n.passwordHash || null}
    WHERE id = ${id}`;
  return n;
}
export async function upsertUser(base) {
  const existing = await getUserById(base.id);
  const u = { plan: "free", twofa: false, level: "ege", ...existing, ...base };
  if (existing) return patchUserById(u.id, u);
  return createUser(u);
}
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u; // eslint-disable-line no-unused-vars
  return safe;
}
