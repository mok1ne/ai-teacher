import { signToken } from "../_lib/auth.js";

// Новый закон РФ: ограничиваем вход по адресам Gmail.
const BLOCKED = /@(gmail|googlemail)\.com$/i;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email, name } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: "invalid_email" });
  if (BLOCKED.test(email)) return res.status(403).json({ error: "gmail_blocked" });

  // DEMO: в проде проверьте пароль по БД (хэш), подтвердите владение почтой и
  // выдайте сессию. Здесь только подписываем токен.
  const id = "email:" + Buffer.from(email.toLowerCase()).toString("base64url").slice(0, 20);
  const user = { id, email, name: name || email.split("@")[0], plan: "free" };
  const token = signToken({ ...user, iat: Date.now() });
  return res.status(200).json({ token, user });
}
