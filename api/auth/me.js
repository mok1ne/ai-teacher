import { verifyToken, getBearer } from "../_lib/auth.js";

export default async function handler(req, res) {
  const u = verifyToken(getBearer(req));
  if (!u) return res.status(401).json({ error: "unauthorized" });
  return res.status(200).json({ user: { id: u.id, email: u.email, name: u.name, plan: u.plan } });
}
