/*
 * Серверный прокси к ИИ + защита бюджета (лимит по аккаунту/IP).
 * Ключ Anthropic живёт ТОЛЬКО на сервере.
 *
 * Лимит: авторизованный пользователь — по тарифу (plan), аноним — по IP.
 * Хранилище счётчика сейчас in-memory (см. api/_lib/limiter.js) — для прода
 * замените на Upstash Redis.
 */
import { verifyToken, getBearer } from "./_lib/auth.js";
import { check, increment } from "./_lib/limiter.js";
import { PLAN_LIMITS } from "./_lib/plans.js";
import { getUserById } from "./_lib/users.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "missing_api_key" });

  const token = verifyToken(getBearer(req));
  let plan = "anon";
  if (token?.email) {
    const account = await getUserById(token.id);
    plan = account?.plan || "free";
  }
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.anon;
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const key = token ? `user:${token.id}` : `ip:${ip}`;

  const gate = check(key, limit);
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
    if (r.ok) increment(key); // списываем ТОЛЬКО при успешном ответе
    return res.status(r.status).json({ ...data, _remaining: r.ok ? gate.remaining - 1 : gate.remaining, _limit: limit });
  } catch (e) {
    return res.status(500).json({ error: "proxy_error" }); // сбой — лимит не тратим
  }
}
