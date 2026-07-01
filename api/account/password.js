import { verifyToken, getBearer } from "../_lib/auth.js";
import { hashPassword, verifyPassword } from "../_lib/password.js";
import { getUserById, patchUserById } from "../_lib/users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const { oldPassword, newPassword } = req.body || {};
  const user = await getUserById(t.id);
  if (!user) return res.status(404).json({ error: "not_found" });
  if (user.provider !== "email") return res.status(400).json({ error: "not_email_account" });
  if (!verifyPassword(oldPassword, user.passwordHash)) return res.status(403).json({ error: "bad_password" });
  if (!newPassword || String(newPassword).length < 6) return res.status(400).json({ error: "weak_password" });
  await patchUserById(t.id, { passwordHash: hashPassword(newPassword) });
  return res.status(200).json({ ok: true });
}
