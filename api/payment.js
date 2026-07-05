import create from "./_lib/routes/payment-create.js";
import webhook from "./_lib/routes/payment-webhook.js";

const MAP = { create, webhook };

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || "";
  const h = MAP[action];
  if (!h) return res.status(404).json({ error: "unknown_action" });
  return h(req, res);
}
