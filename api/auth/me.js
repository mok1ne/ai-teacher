import { verifyToken, getBearer } from "../_lib/auth.js";
import { getUserById, getUserByEmail, publicUser } from "../_lib/users.js";

export default async function handler(req, res) {
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });
  const user = (await getUserById(t.id)) || (await getUserByEmail(t.email));
  if (!user) return res.status(401).json({ error: "unauthorized" });
  return res.status(200).json({ user: publicUser(user) });
}
