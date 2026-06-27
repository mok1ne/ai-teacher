/*
 * Серверный прокси к ИИ + защита бюджета (лимит по аккаунту/IP).
 * Ключ Anthropic живёт ТОЛЬКО на сервере.
 *
 * Лимит: авторизованный пользователь — по тарифу (plan), аноним — по IP.
 * Хранилище счётчика сейчас in-memory (см. api/_lib/limiter.js) — для прода
 * замените на Upstash Redis.
 */
import { verifyToken, getBearer } from "./_lib/auth.js";
import { checkAndIncrement } from "./_lib/limiter.js";
import { PLAN_LIMITS } from "./_lib/plans.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "missing_api_key" });

  const user = verifyToken(getBearer(req));
  const plan = user?.plan || "anon";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.anon;
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const key = user ? `user:${user.id}` : `ip:${ip}`;

  const gate = checkAndIncrement(key, limit);
  if (!gate.allowed) {
    return res.status(429).json({ error: "rate_limited", remaining: 0, limit, plan });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    return res.status(r.status).json({ ...data, _remaining: gate.remaining, _limit: limit });
  } catch (e) {
    return res.status(500).json({ error: "proxy_error" });
  }
}
