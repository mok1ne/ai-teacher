import name from "./_lib/routes/account-name.js";
import password from "./_lib/routes/account-password.js";
import twofa from "./_lib/routes/account-twofa.js";
import phone from "./_lib/routes/account-phone.js";
import level from "./_lib/routes/account-level.js";

const MAP = { name, password, twofa, phone, level };

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || "";
  const h = MAP[action];
  if (!h) return res.status(404).json({ error: "unknown_action" });
  return h(req, res);
}
