import { verifyToken, getBearer } from "../auth.js";
import { patchUserById, publicUser } from "../users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const enabled = !!(req.body || {}).enabled;
  // Флаг включения 2FA. Реальная доставка кодов (СМС/TOTP) подключается отдельно.
  const u = await patchUserById(t.id, { twofa: enabled });
  if (!u) return res.status(404).json({ error: "not_found" });
  return res.status(200).json({ user: publicUser(u) });
}
