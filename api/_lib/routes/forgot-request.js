import { getUserByEmail } from "../users.js";
import { setCode } from "../reset.js";
import { sendResetEmail } from "../email.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const email = String((req.body || {}).email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "invalid_email" });

  const user = await getUserByEmail(email);
  // Не раскрываем, существует ли аккаунт: всегда отвечаем sent:true.
  if (!user || user.provider !== "email") return res.status(200).json({ sent: true });

  const code = String(Math.floor(1000 + Math.random() * 9000));
  await setCode(email, code);
  const info = await sendResetEmail(email, code);
  // devCode возвращается только в демо-режиме (когда не настроен почтовый провайдер)
  return res.status(200).json({ sent: true, ...(info.demo ? { devCode: info.devCode } : {}) });
}
