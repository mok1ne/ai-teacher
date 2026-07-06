import { signToken } from "../auth.js";
import { getUserByPhone, createUser, publicUser } from "../users.js";

const normalizePhone = (p) => "+" + String(p || "").replace(/\D/g, "").replace(/^8/, "7");

// Вход/регистрация по телефону. Если телефон уже привязан к аккаунту (в т.ч.
// созданному через почту) — входим в ТОТ ЖЕ аккаунт. Иначе создаём новый.
// ДЕМО: код из СМС не проверяется по-настоящему (принимается любой из 4 цифр);
// в проде замените на проверку кода, отправленного СМС-провайдером.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const { phone, code, name, age, level } = req.body || {};
  const p = normalizePhone(phone);
  if (p.replace(/\D/g, "").length < 11) return res.status(400).json({ error: "invalid_phone" });
  if (!/^\d{4}$/.test(String(code || ""))) return res.status(400).json({ error: "bad_code" });

  let user = await getUserByPhone(p);
  if (!user) {
    if (!name || !String(name).trim()) return res.status(200).json({ needsProfile: true });
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return res.status(400).json({ error: "invalid_age" });
    user = { id: "phone:" + p, phone: p, name: String(name).trim(), age: a, plan: "free", twofa: false, provider: "phone", level: level === "oge" ? "oge" : "ege" };
    await createUser(user);
  }
  const token = signToken({ id: user.id, email: user.email || null, iat: Date.now() });
  return res.status(200).json({ token, user: publicUser(user) });
}
