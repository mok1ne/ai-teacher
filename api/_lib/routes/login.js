import { signToken } from "../auth.js";
import { verifyPassword } from "../password.js";
import { getUserByEmail, publicUser } from "../users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email, password } = req.body || {};
  const mail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return res.status(400).json({ error: "invalid_email" });

  const user = await getUserByEmail(mail);
  if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ error: "bad_credentials" });

  const token = signToken({ id: user.id, email: mail, iat: Date.now() });
  return res.status(200).json({ token, user: publicUser(user) });
}
