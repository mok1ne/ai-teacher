import { verifyToken, getBearer } from "../auth.js";
import { patchUserById, publicUser } from "../users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const name = String((req.body || {}).name || "").trim();
  if (!name) return res.status(400).json({ error: "empty_name" });
  const u = await patchUserById(t.id, { name });
  if (!u) return res.status(404).json({ error: "not_found" });
  return res.status(200).json({ user: publicUser(u) });
}
