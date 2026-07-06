import { verifyToken, getBearer } from "../auth.js";
import { patchUserById, publicUser } from "../users.js";

// Сменить уровень подготовки (ЕГЭ/ОГЭ).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const level = (req.body || {}).level === "oge" ? "oge" : "ege";
  const u = await patchUserById(t.id, { level });
  if (!u) return res.status(404).json({ error: "not_found" });
  return res.status(200).json({ user: publicUser(u) });
}
