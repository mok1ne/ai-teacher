import { verifyToken, getBearer } from "../_lib/auth.js";
import crypto from "node:crypto";

const PRICES = { "Базовый": 990, "Стандарт": 1990, "Премиум": 2990 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const user = verifyToken(getBearer(req));
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const { plan } = req.body || {};
  const amount = PRICES[plan];
  if (!amount) return res.status(400).json({ error: "unknown_plan" });

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  const returnUrl = (req.headers.origin || "") + "/parent?paid=1";

  // DEMO без ключей ЮKassa — возвращаем return_url, чтобы пройти поток.
  if (!shopId || !secret) {
    return res.status(200).json({ demo: true, confirmationUrl: returnUrl });
  }

  try {
    const auth = Buffer.from(`${shopId}:${secret}`).toString("base64");
    const r = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": crypto.randomUUID(),
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: { value: amount.toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: returnUrl },
        description: `Подписка «${plan}» — Время сдавать`,
        metadata: { userId: user.id, plan },
      }),
    });
    const d = await r.json();
    if (d.confirmation?.confirmation_url) {
      return res.status(200).json({ confirmationUrl: d.confirmation.confirmation_url, paymentId: d.id });
    }
    return res.status(502).json({ error: "yookassa_error", detail: d });
  } catch (e) {
    return res.status(500).json({ error: "payment_error" });
  }
}
