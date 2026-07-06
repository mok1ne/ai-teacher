import { verifyToken, getBearer } from "../auth.js";
import { getUserByPhone, patchUserById, publicUser } from "../users.js";

const normalizePhone = (p) => "+" + String(p || "").replace(/\D/g, "").replace(/^8/, "7");

// Привязать номер телефона к текущему аккаунту (чтобы потом входить по нему).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const p = normalizePhone((req.body || {}).phone);
  if (p.replace(/\D/g, "").length < 11) return res.status(400).json({ error: "invalid_phone" });

  const other = await getUserByPhone(p);
  if (other && other.id !== t.id) return res.status(409).json({ error: "phone_taken" });

  const u = await patchUserById(t.id, { phone: p });
  if (!u) return res.status(404).json({ error: "not_found" });
  return res.status(200).json({ user: publicUser(u) });
}
