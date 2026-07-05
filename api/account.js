import name from "./_lib/routes/account-name.js";
import password from "./_lib/routes/account-password.js";
import twofa from "./_lib/routes/account-twofa.js";

const MAP = { name, password, twofa };

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || "";
  const h = MAP[action];
  if (!h) return res.status(404).json({ error: "unknown_action" });
  return h(req, res);
}
