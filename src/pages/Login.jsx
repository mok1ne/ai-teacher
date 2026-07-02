import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, Lock, User, Calendar, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

const MSG = {
  invalid_email: "Введите корректную почту.",
  invalid_phone: "Введите корректный номер телефона.",
  weak_password: "Пароль должен быть не короче 6 символов.",
  password_mismatch: "Пароли не совпадают.",
  empty_name: "Введите имя.",
  invalid_age: "Введите корректный возраст.",
  exists: "Такая почта уже зарегистрирована — войдите.",
  bad_credentials: "Неверная почта или пароль.",
  bad_code: "Введите код из 4 цифр.",
  no_account: "Аккаунт с такой почтой не найден.",
  network: "Сервер недоступен. Попробуйте снова.",
};

function Field({ icon: Icon, ...props }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "11px 14px" }}>
      <Icon size={18} style={{ color: C.soft }} />
      <input {...props} style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", color: C.ink, background: "transparent" }} />
    </div>
  );
}
const submitBtn = { width: "100%", justifyContent: "center", padding: "13px" };

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const { user, loading, loginEmail, registerEmail, resetPassword, phoneExists, requestPhoneCode, phoneAuth, loginVK } = useAuth();

  const [method, setMethod] = useState("email");   // email | phone
  const [mode, setMode] = useState("login");        // login | register (для почты)
  const [step, setStep] = useState(1);              // регистрация по почте
  const [forgot, setForgot] = useState(false);
  const [phoneStep, setPhoneStep] = useState("phone"); // phone | code | profile

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  if (!loading && user) return <Navigate to={next} replace />;

  const fail = (e) => setErr(MSG[e?.message] || "Не удалось. Проверьте данные и попробуйте снова.");
  const resetState = () => { setErr(""); setInfo(""); };

  // --- почта: вход ---
  const doLogin = async () => {
    setBusy(true); resetState();
    try { await loginEmail(email.trim(), password); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  // --- почта: регистрация ---
  const nextStep = () => {
    resetState();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr(MSG.invalid_email);
    if (password.length < 6) return setErr(MSG.weak_password);
    if (password !== password2) return setErr(MSG.password_mismatch);
    setStep(2);
  };
  const doRegister = async () => {
    resetState();
    if (!name.trim()) return setErr(MSG.empty_name);
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return setErr(MSG.invalid_age);
    setBusy(true);
    try { await registerEmail(email.trim(), password, name.trim(), a); navigate(next); }
    catch (e) { fail(e); if (e.message === "exists") { setMode("login"); } setStep(1); }
    finally { setBusy(false); }
  };
  // --- почта: восстановление ---
  const doReset = async () => {
    resetState();
    if (password.length < 6) return setErr(MSG.weak_password);
    if (password !== password2) return setErr(MSG.password_mismatch);
    setBusy(true);
    try { await resetPassword(email.trim(), password); setForgot(false); setPassword(""); setPassword2(""); setInfo("Пароль обновлён — теперь войдите."); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  // --- телефон ---
  const sendCode = async () => {
    resetState(); setBusy(true);
    try { await requestPhoneCode(phone); setPhoneStep("code"); setInfo("Демо: введите любые 4 цифры как код из СМС."); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const submitCode = async () => {
    resetState();
    if (!/^\d{4}$/.test(code)) return setErr(MSG.bad_code);
    if (!phoneExists(phone)) { setPhoneStep("profile"); return; } // новый пользователь — попросим имя и возраст
    setBusy(true);
    try { await phoneAuth(phone, code); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const submitPhoneProfile = async () => {
    resetState();
    if (!name.trim()) return setErr(MSG.empty_name);
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return setErr(MSG.invalid_age);
    setBusy(true);
    try { await phoneAuth(phone, code, name.trim(), a); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  const switchMethod = (m) => { setMethod(m); setForgot(false); setStep(1); setPhoneStep("phone"); resetState(); };
  const switchMode = (m) => { setMode(m); setStep(1); setForgot(false); resetState(); setPassword(""); setPassword2(""); };

  return (
    <main className="page" style={{ maxWidth: 460, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ margin: "0 auto 12px", width: 52 }}><Logo size={52} /></div>
        <h1 style={{ fontSize: 25, fontWeight: 800, margin: "0 0 6px" }}>«Время сдавать»</h1>
        <p style={{ fontSize: 14.5, color: C.mut, margin: 0 }}>Сохраняйте прогресс, занимайтесь с ИИ и оформляйте подписку.</p>
      </div>

      {/* способ входа */}
      <div style={{ display: "flex", background: "#EEF2F8", borderRadius: 12, padding: 4, gap: 4, marginBottom: 14 }}>
        {[["email", "Почта"], ["phone", "Телефон"]].map(([m, label]) => (
          <button key={m} onClick={() => switchMethod(m)}
            style={{ flex: 1, border: "none", cursor: "pointer", padding: "9px", borderRadius: 9, fontSize: 14.5, fontWeight: 700,
              background: method === m ? "#fff" : "transparent", color: method === m ? C.purple : C.mut, boxShadow: method === m ? "0 2px 8px -4px #0f172a55" : "none" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 24, boxShadow: "0 14px 40px -28px #0f172a55" }}>
        {/* ===== ПОЧТА ===== */}
        {method === "email" && !forgot && (
          <>
            <div style={{ display: "flex", background: "#F5F7FB", borderRadius: 10, padding: 3, gap: 3, marginBottom: 16 }}>
              {[["login", "Вход"], ["register", "Регистрация"]].map(([m, label]) => (
                <button key={m} onClick={() => switchMode(m)}
                  style={{ flex: 1, border: "none", cursor: "pointer", padding: "8px", borderRadius: 8, fontSize: 13.5, fontWeight: 700,
                    background: mode === m ? "#fff" : "transparent", color: mode === m ? C.ink : C.soft }}>{label}</button>
              ))}
            </div>

            {mode === "login" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                <Field icon={Lock} type="password" value={password} placeholder="Пароль" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} />
                <div style={{ textAlign: "right" }}>
                  <button onClick={() => { setForgot(true); resetState(); setPassword(""); setPassword2(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.purple, fontSize: 13, fontFamily: "inherit" }}>Забыли пароль?</button>
                </div>
                <Button onClick={doLogin} disabled={busy} style={submitBtn}>{busy ? "Входим…" : "Войти"}</Button>
              </div>
            )}

            {mode === "register" && step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                <Field icon={Lock} type="password" value={password} placeholder="Пароль (от 6 символов)" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                <Field icon={Lock} type="password" value={password2} placeholder="Повторите пароль" autoComplete="new-password" onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nextStep()} />
                <Button onClick={nextStep} style={submitBtn}>Далее <ArrowRight size={16} /></Button>
              </div>
            )}
            {mode === "register" && step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 13.5, color: C.mut, marginBottom: 2 }}>Последний шаг — расскажите о себе:</div>
                <Field icon={User} type="text" value={name} placeholder="Имя" autoComplete="given-name" onChange={(e) => setName(e.target.value)} />
                <Field icon={Calendar} type="number" value={age} placeholder="Возраст" min="7" max="100" onChange={(e) => setAge(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doRegister()} />
                <Button onClick={doRegister} disabled={busy} style={submitBtn}>{busy ? "Создаём…" : "Создать аккаунт"}</Button>
                <button onClick={() => { setStep(1); resetState(); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.soft, fontSize: 13, fontFamily: "inherit" }}>← Назад</button>
              </div>
            )}
          </>
        )}

        {/* ===== ВОССТАНОВЛЕНИЕ ПАРОЛЯ ===== */}
        {method === "email" && forgot && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Восстановление пароля</div>
            <Field icon={Mail} type="email" value={email} placeholder="Почта аккаунта" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
            <Field icon={Lock} type="password" value={password} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
            <Field icon={Lock} type="password" value={password2} placeholder="Повторите новый пароль" autoComplete="new-password" onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doReset()} />
            <Button onClick={doReset} disabled={busy} style={submitBtn}>{busy ? "Сохраняем…" : "Сохранить новый пароль"}</Button>
            <button onClick={() => { setForgot(false); resetState(); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.soft, fontSize: 13, fontFamily: "inherit" }}>← Назад ко входу</button>
          </div>
        )}

        {/* ===== ТЕЛЕФОН ===== */}
        {method === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {phoneStep === "phone" && (
              <>
                <Field icon={Phone} type="tel" value={phone} placeholder="+7 900 000-00-00" autoComplete="tel" onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendCode()} />
                <Button onClick={sendCode} disabled={busy} style={submitBtn}>{busy ? "Отправляем…" : "Получить код"}</Button>
              </>
            )}
            {phoneStep === "code" && (
              <>
                <Field icon={Lock} type="text" inputMode="numeric" maxLength={4} value={code} placeholder="Код из СМС (4 цифры)" onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && submitCode()} />
                <Button onClick={submitCode} disabled={busy} style={submitBtn}>{busy ? "Проверяем…" : "Подтвердить"}</Button>
                <button onClick={() => { setPhoneStep("phone"); setCode(""); resetState(); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.soft, fontSize: 13, fontFamily: "inherit" }}>← Изменить номер</button>
              </>
            )}
            {phoneStep === "profile" && (
              <>
                <div style={{ fontSize: 13.5, color: C.mut }}>Вы впервые — расскажите о себе:</div>
                <Field icon={User} type="text" value={name} placeholder="Имя" onChange={(e) => setName(e.target.value)} />
                <Field icon={Calendar} type="number" value={age} placeholder="Возраст" min="7" max="100" onChange={(e) => setAge(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPhoneProfile()} />
                <Button onClick={submitPhoneProfile} disabled={busy} style={submitBtn}>{busy ? "Создаём…" : "Создать аккаунт"}</Button>
              </>
            )}
          </div>
        )}

        {info && <div style={{ fontSize: 13, color: C.greenDk, marginTop: 12 }}>{info}</div>}
        {err && <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 12, lineHeight: 1.45 }}>{err}</div>}

        {/* разделитель + VK НИЖЕ полей */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: C.line }} />
          <span style={{ fontSize: 12.5, color: C.soft }}>или</span>
          <div style={{ flex: 1, height: 1, background: C.line }} />
        </div>
        <Button color="#0077FF" onClick={loginVK} style={{ width: "100%", justifyContent: "center", fontSize: 15.5, padding: "13px" }}>
          Войти через VK ID <ArrowRight size={17} />
        </Button>
      </div>

      <p style={{ fontSize: 12, color: C.soft, marginTop: 16, textAlign: "center", lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <ShieldCheck size={14} /> Продолжая, вы соглашаетесь с
        <a href="/legal/offer" style={{ color: C.purple }}>условиями</a> и
        <a href="/legal/privacy" style={{ color: C.purple }}>политикой</a>.
      </p>
    </main>
  );
}