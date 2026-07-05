import { signToken } from "../auth.js";
import { upsertUser, publicUser } from "../users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { code, redirectUri } = req.body || {};
  if (!code) return res.status(400).json({ error: "missing_code" });

  try {
    if (process.env.VK_APP_ID && process.env.VK_SECURE_KEY) {
      const tr = await fetch(
        `https://oauth.vk.com/access_token?client_id=${process.env.VK_APP_ID}` +
        `&client_secret=${process.env.VK_SECURE_KEY}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(code)}`
      );
      const t = await tr.json();
      if (!t.access_token) return res.status(401).json({ error: "vk_token_failed" });
      let name = "Пользователь VK";
      try {
        const pr = await fetch(`https://api.vk.com/method/users.get?user_ids=${t.user_id}&access_token=${t.access_token}&v=5.131`);
        const p = (await pr.json()).response?.[0];
        if (p) name = `${p.first_name} ${p.last_name}`;
      } catch { /* ignore */ }
      const user = await upsertUser({ id: "vk:" + t.user_id, email: t.email || null, name, provider: "vk" });
      const token = signToken({ id: user.id, email: user.email, iat: Date.now() });
      return res.status(200).json({ token, user: publicUser(user) });
    }
    // DEMO без VK-приложения
    const user = await upsertUser({ id: "vk:demo", email: null, name: "Гость VK", provider: "vk" });
    const token = signToken({ id: user.id, email: user.email, iat: Date.now() });
    return res.status(200).json({ token, user: publicUser(user), demo: true });
  } catch {
    return res.status(500).json({ error: "vk_error" });
  }
}
