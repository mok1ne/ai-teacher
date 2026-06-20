/*
 * Единая точка вызова ИИ. На реальном сайте запрос идёт на ВАШ бэкенд-прокси
 * (/api/chat), который добавляет секретный ключ и ходит в Anthropic.
 * Ключ НИКОГДА не должен попадать в браузер.
 *
 * Чтобы сменить модель на YandexGPT / GigaChat — меняется только прокси
 * (api/chat.js), эта функция остаётся прежней.
 */
const ENDPOINT = import.meta.env.VITE_API_URL || "/api/chat";

export async function callClaude(apiMessages, topic, examName, source) {
  let system =
    `Ты — ИИ-репетитор сервиса «Время сдавать» для подготовки к ЕГЭ и ОГЭ. Строгие правила:\n` +
    `1. НЕ выдумывай факты. Если не уверен — честно скажи об этом, а не сочиняй.\n` +
    `2. Объясняй простым понятным языком, пошагово, с короткими примерами.\n` +
    `3. В вычислениях будь точен и показывай ход решения.\n` +
    `4. Поддерживай и мотивируй ученика, хвали за прогресс — но без лести.\n` +
    `5. Отвечай кратко: это чат. Если тема большая — разбей на шаги.\n` +
    `Текущая тема: «${topic}». Экзамен: ${examName}.`;
  if (source) {
    system +=
      `\n\nИспользуй для фактов по теме ТОЛЬКО проверенный источник ниже. Не добавляй фактов сверх него. ` +
      `Если вопрос выходит за рамки источника — прямо скажи, что в проверенной базе этого нет, и не сочиняй. ` +
      `В конце ответа добавь строку «📚 Источник: ${source.ref}».\n\n` +
      `ПРОВЕРЕННЫЙ ИСТОЧНИК (${source.ref}):\n${source.content}`;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", // качество; для экономии — "claude-haiku-4-5-20251001"
      max_tokens: 1000,
      system,
      messages: apiMessages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error("network");
  const data = await res.json();
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}
