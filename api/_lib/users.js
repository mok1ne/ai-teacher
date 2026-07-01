import { kvGet, kvSet } from "./store.js";

// Ключ = user:<id>, где id = "email:<почта>" или "vk:<id>".
const key = (id) => "user:" + id;
const emailId = (email) => "email:" + String(email).trim().toLowerCase();

export async function getUserById(id) { return id ? kvGet(key(id)) : null; }
export async function getUserByEmail(email) { return email ? kvGet(key(emailId(email))) : null; }
export async function saveUser(user) { await kvSet(key(user.id), user); return user; }
export async function patchUserById(id, patch) {
  const u = await getUserById(id);
  if (!u) return null;
  const next = { ...u, ...patch };
  await kvSet(key(id), next);
  return next;
}
export function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...safe } = u; // eslint-disable-line no-unused-vars
  return safe;
}
