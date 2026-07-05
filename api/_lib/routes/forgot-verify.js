import { signToken } from "../auth.js";
import { hashPassword } from "../password.js";
import { getUserByEmail, patchUserById, publicUser } from "../users.js";
import { checkCode, clearCode } from "../reset.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email, code, newPassword } = req.body || {};
  const mail = String(email || "").trim().toLowerCase();

  if (!(await checkCode(mail, code))) return res.status(400).json({ error: "bad_code" });
  if (!newPassword || String(newPassword).length < 6) return res.status(400).json({ error: "weak_password" });

  const user = await getUserByEmail(mail);
  if (!user) return res.status(404).json({ error: "not_found" });

  await patchUserById(user.id, { passwordHash: hashPassword(newPassword) });
  await clearCode(mail);
  // автоматический вход после смены пароля
  const token = signToken({ id: user.id, email: mail, iat: Date.now() });
  return res.status(200).json({ token, user: publicUser({ ...user, passwordHash: null }) });
}
