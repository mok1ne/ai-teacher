/*
 * Серверный прокси к Anthropic. Ключ живёт ТОЛЬКО на сервере (env-переменная),
 * в браузер не попадает. Подходит для Vercel (папка /api) — функция доступна
 * по адресу /api/chat. Для Netlify/своего сервера логика та же.
 *
 * Чтобы перейти на YandexGPT / GigaChat — поменяйте URL, заголовки авторизации
 * и формат тела запроса здесь; фронтенд менять не нужно.
 *
 * Перед запуском задайте переменную окружения:
 *   ANTHROPIC_API_KEY=sk-ant-...
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "missing_api_key" });

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
    return res.status(r.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: "proxy_error" });
  }
}
