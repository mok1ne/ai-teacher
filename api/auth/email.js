import { signToken } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { email } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email)) return res.status(400).json({ error: "invalid_email" });

  // DEMO: в проде отправьте на почту код или магик-ссылку, подтвердите владение
  // и сохраните пользователя в БД. Здесь сразу выдаём сессию.
  const id = "email:" + Buffer.from(email.toLowerCase()).toString("base64url").slice(0, 20);
  const user = { id, email, name: email.split("@")[0], plan: "free" };
  const token = signToken({ ...user, iat: Date.now() });
  return res.status(200).json({ token, user });
}
