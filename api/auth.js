import register from "./_lib/routes/register.js";
import login from "./_lib/routes/login.js";
import me from "./_lib/routes/me.js";
import vk from "./_lib/routes/vk.js";
import forgotRequest from "./_lib/routes/forgot-request.js";
import forgotVerify from "./_lib/routes/forgot-verify.js";
import phone from "./_lib/routes/phone.js";
import { rateLimit, clientIp } from "./_lib/ratelimit.js";

const MAP = { register, login, me, vk, "forgot-request": forgotRequest, "forgot-verify": forgotVerify, phone };
// лимиты попыток на IP+действие (антибрутфорс паролей/кодов, антиспам писем)
const LIMITS = {
  login: { max: 8, windowMs: 60000 },
  register: { max: 5, windowMs: 600000 },
  "forgot-request": { max: 4, windowMs: 600000 },
  "forgot-verify": { max: 10, windowMs: 600000 },
  phone: { max: 8, windowMs: 300000 },
};

export default async function handler(req, res) {
  const action = (req.query && req.query.action) || "";
  const h = MAP[action];
  if (!h) return res.status(404).json({ error: "unknown_action" });
  const cfg = LIMITS[action];
  if (cfg && !rateLimit(`${clientIp(req)}:${action}`, cfg)) {
    return res.status(429).json({ error: "too_many_requests" });
  }
  return h(req, res);
}
