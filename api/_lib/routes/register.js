import { signToken } from "../auth.js";
import { hashPassword } from "../password.js";
import { getUserByEmail, createUser, publicUser } from "../users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email, password, name, age } = req.body || {};
  const mail = String(email || "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return res.status(400).json({ error: "invalid_email" });
  if (!password || String(password).length < 6) return res.status(400).json({ error: "weak_password" });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "empty_name" });
  const a = parseInt(age, 10);
  if (!a || a < 7 || a > 100) return res.status(400).json({ error: "invalid_age" });

  if (await getUserByEmail(mail)) return res.status(409).json({ error: "exists" });

  const user = {
    id: "email:" + mail, email: mail, name: String(name).trim(), age: a,
    plan: "free", twofa: false, provider: "email",
    passwordHash: hashPassword(password), createdAt: Date.now(),
  };
  await createUser(user);
  const token = signToken({ id: user.id, email: mail, iat: Date.now() });
  return res.status(200).json({ token, user: publicUser(user) });
}
