import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, Lock, User, Calendar } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

const MSG = {
  gmail_blocked: "Вход по адресам @gmail.com сейчас недоступен для пользователей из РФ. Используйте другую почту (Яндекс, Mail.ru) или войдите через VK.",
  invalid_email: "Введите корректную почту.",
  weak_password: "Пароль должен быть не короче 6 символов.",
  exists: "Такая почта уже зарегистрирована — войдите.",
  no_account: "Аккаунт с такой почтой не найден — зарегистрируйтесь.",
  bad_password: "Неверный пароль.",
};

function Field({ icon: Icon, ...props }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "11px 14px" }}>
      <Icon size={18} style={{ color: C.soft }} />
      <input {...props} style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", color: C.ink, background: "transparent" }} />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const { loginEmail, registerEmail, loginVK } = useAuth();

  const [mode, setMode] = useState("login");   // login | register
  const [step, setStep] = useState(1);          // для регистрации: 1 почта+пароль, 2 имя+возраст
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const fail = (e) => setErr(MSG[e?.message] || "Не удалось. Проверьте данные и попробуйте снова.");

  const doLogin = async () => {
    setBusy(true); setErr("");
    try { await loginEmail(email.trim(), password); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  const nextStep = () => {
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr(MSG.invalid_email);
    if (/@(gmail|googlemail)\.com$/i.test(email.trim())) return setErr(MSG.gmail_blocked);
    if (password.length < 6) return setErr(MSG.weak_password);
    setStep(2);
  };

  const doRegister = async () => {
    setErr("");
    if (!name.trim()) return setErr("Введите имя.");
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return setErr("Введите корректный возраст.");
    setBusy(true);
    try { await registerEmail(email.trim(), password, name.trim(), a); navigate(next); }
    catch (e) { fail(e); setStep(1); } finally { setBusy(false); }
  };

  const switchMode = (m) => { setMode(m); setStep(1); setErr(""); setPassword(""); };

  return (
    <main className="page" style={{ maxWidth: 460, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ margin: "0 auto 12px", width: 52 }}><Logo size={52} /></div>
        <h1 style={{ fontSize: 25, fontWeight: 800, margin: "0 0 6px" }}>«Время сдавать»</h1>
        <p style={{ fontSize: 14.5, color: C.mut, margin: 0 }}>Сохраняйте прогресс, занимайтесь с ИИ и оформляйте подписку.</p>
      </div>

      {/* переключатель вход / регистрация */}
      <div style={{ display: "flex", background: "#EEF2F8", borderRadius: 12, padding: 4, gap: 4, marginBottom: 18 }}>
        {[["login", "Вход"], ["register", "Регистрация"]].map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)}
            style={{ flex: 1, border: "none", cursor: "pointer", padding: "9px", borderRadius: 9, fontSize: 14.5, fontWeight: 700,
              background: mode === m ? "#fff" : "transparent", color: mode === m ? C.purple : C.mut,
              boxShadow: mode === m ? "0 2px 8px -4px #0f172a55" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 24, boxShadow: "0 14px 40px -28px #0f172a55" }}>
        <Button color="#0077FF" onClick={loginVK} style={{ width: "100%", justifyContent: "center", fontSize: 15.5, padding: "13px" }}>
          Войти через VK ID <ArrowRight size={17} />
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.line }} />
          <span style={{ fontSize: 12.5, color: C.soft }}>или по почте</span>
          <div style={{ flex: 1, height: 1, background: C.line }} />
        </div>

        {mode === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} />
            <Field icon={Lock} type="password" value={password} placeholder="Пароль" autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} />
            <Button onClick={doLogin} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {busy ? "Входим…" : "Войти"}
            </Button>
          </div>
        )}

        {mode === "register" && step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} />
            <Field icon={Lock} type="password" value={password} placeholder="Придумайте пароль (от 6 символов)" autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nextStep()} />
            <Button onClick={nextStep} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              Далее <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {mode === "register" && step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 2 }}>Последний шаг — расскажите о себе:</div>
            <Field icon={User} type="text" value={name} placeholder="Имя" autoComplete="given-name"
              onChange={(e) => setName(e.target.value)} />
            <Field icon={Calendar} type="number" value={age} placeholder="Возраст" min="7" max="100"
              onChange={(e) => setAge(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doRegister()} />
            <Button onClick={doRegister} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
              {busy ? "Создаём…" : "Создать аккаунт"}
            </Button>
            <button onClick={() => { setStep(1); setErr(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.soft, fontSize: 13, fontFamily: "inherit" }}>← Назад</button>
          </div>
        )}

        {err && <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 12, lineHeight: 1.45 }}>{err}</div>}
      </div>

      <p style={{ fontSize: 12, color: C.soft, marginTop: 16, textAlign: "center", lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <ShieldCheck size={14} /> Продолжая, вы соглашаетесь на обработку данных (152-ФЗ).
      </p>
    </main>
  );
}
