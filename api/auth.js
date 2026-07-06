import register from "./_lib/routes/register.js";
import login from "./_lib/routes/login.js";
import me from "./_lib/routes/me.js";
import vk from "./_lib/routes/vk.js";
import forgotRequest from "./_lib/routes/forgot-request.js";
import forgotVerify from "./_lib/routes/forgot-verify.js";
import phone from "./_lib/routes/phone.js";

const MAP = { register, login, me, vk, "forgot-request": forgotRequest, "forgot-verify": forgotVerify, phone };

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || "";
  const h = MAP[action];
  if (!h) return res.status(404).json({ error: "unknown_action" });
  return h(req, res);
}
