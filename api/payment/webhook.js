/*
 * Уведомления ЮKassa (payment.succeeded). В проде нужно:
 *  1) проверить подлинность запроса (доверенные IP ЮKassa),
 *  2) найти пользователя по object.metadata.userId,
 *  3) активировать подписку (plan) в вашей БД,
 *  4) вернуть 200.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const event = req.body || {};
    if (event.event === "payment.succeeded") {
      const { userId, plan } = event.object?.metadata || {};
      // TODO: db.activateSubscription(userId, plan)
      console.log("payment.succeeded", userId, plan);
    }
  } catch { /* ignore */ }
  return res.status(200).json({ ok: true });
}
