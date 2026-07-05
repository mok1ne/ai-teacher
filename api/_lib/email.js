// Отправка письма с кодом. Если задан RESEND_API_KEY — реальная отправка через
// Resend; иначе демо-режим: код пишется в лог и возвращается для показа.
export async function sendResetEmail(email, code) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Время сдавать <onboarding@resend.dev>";
  if (!key) { console.log(`[email demo] код для ${email}: ${code}`); return { demo: true, devCode: code }; }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: email, subject: "Код для смены пароля — Время сдавать",
      html: `<p>Ваш код для смены пароля: <b style="font-size:20px">${code}</b></p><p>Код действует 10 минут. Если вы не запрашивали смену — просто проигнорируйте письмо.</p>`,
    }),
  });
  return { demo: false };
}
