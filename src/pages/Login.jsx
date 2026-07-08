import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, Lock, User, Calendar, Phone } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import "./Login.scss";

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
    <div className="field">
      <Icon size={18} className="field__icon" />
      <input {...props} className="field__input" />
    </div>
  );
}
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const submitBtn = { width: "100%", justifyContent: "center", padding: "13px" };

function LevelChoice({ value, onChange }) {
  return (
    <div className="level-choice">
      {[["ege", "ЕГЭ", "11 класс"], ["oge", "ОГЭ", "9 класс"]].map(([v, t, s]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={`level-choice__opt${value === v ? " level-choice__opt--active" : ""}`}>
          <div className="level-choice__title">{t}</div>
          <div className="level-choice__sub">{s}</div>
        </button>
      ))}
    </div>
  );
}

// Всегда приводим ввод к формату +7 XXX XXX-XX-XX.
function formatPhone(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d.startsWith("7")) d = d.slice(1);
  d = d.slice(0, 10);
  let out = "+7";
  if (d.length) out += " " + d.slice(0, 3);
  if (d.length > 3) out += " " + d.slice(3, 6);
  if (d.length > 6) out += "-" + d.slice(6, 8);
  if (d.length > 8) out += "-" + d.slice(8, 10);
  return out;
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const { user, loading, loginEmail, registerEmail, requestResetCode, resetPasswordWithCode, requestPhoneCode, phoneAuth, loginVK } = useAuth();

  const [method, setMethod] = useState("email");
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [forgot, setForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState("request");
  const [resetCode, setResetCode] = useState("");
  const [phoneStep, setPhoneStep] = useState("phone");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState("ege");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  if (!loading && user) return <Navigate to={next} replace />;

  const fail = (e) => setErr(MSG[e?.message] || "Не удалось. Проверьте данные и попробуйте снова.");
  const resetState = () => { setErr(""); setInfo(""); };

  const doLogin = async () => {
    setBusy(true); resetState();
    try { await loginEmail(email.trim(), password); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const nextStep = () => {
    resetState();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr(MSG.invalid_email);
    if (password.length < 6) return setErr(MSG.weak_password);
    if (password !== password2) return setErr(MSG.password_mismatch);
    setStep(2);
  };
  const nextToLevel = () => {
    resetState();
    if (!name.trim()) return setErr(MSG.empty_name);
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return setErr(MSG.invalid_age);
    setStep(3);
  };
  const doRegister = async () => {
    resetState();
    const a = parseInt(age, 10);
    setBusy(true);
    try { await registerEmail(email.trim(), password, name.trim(), a, level); navigate(next); }
    catch (e) { fail(e); if (e.message === "exists") { setMode("login"); } setStep(1); }
    finally { setBusy(false); }
  };
  const doRequestCode = async () => {
    resetState(); setBusy(true);
    try {
      const { demoCode } = await requestResetCode(email.trim());
      setForgotStep("code");
      setInfo(demoCode ? `Демо: код отправлен бы на почту. Ваш код — ${demoCode}` : "Код отправлен на вашу почту.");
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const doResetCode = async () => {
    resetState();
    if (!/^\d{4}$/.test(resetCode)) return setErr(MSG.bad_code);
    if (password.length < 6) return setErr(MSG.weak_password);
    if (password !== password2) return setErr(MSG.password_mismatch);
    setBusy(true);
    try { await resetPasswordWithCode(email.trim(), resetCode, password); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  const sendCode = async () => {
    resetState(); setBusy(true);
    try { await requestPhoneCode(phone); setPhoneStep("code"); setInfo("Демо: введите любые 4 цифры как код из СМС."); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const submitCode = async () => {
    resetState();
    if (!/^\d{4}$/.test(code)) return setErr(MSG.bad_code);
    setBusy(true);
    try { await phoneAuth(phone, code); navigate(next); }
    catch (e) { if (e.message === "needs_profile") setPhoneStep("profile"); else fail(e); }
    finally { setBusy(false); }
  };
  const submitPhoneProfile = async () => {
    resetState();
    if (!name.trim()) return setErr(MSG.empty_name);
    const a = parseInt(age, 10);
    if (!a || a < 7 || a > 100) return setErr(MSG.invalid_age);
    setBusy(true);
    try { await phoneAuth(phone, code, name.trim(), a, level); navigate(next); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  const switchMethod = (m) => { setMethod(m); setForgot(false); setForgotStep("request"); setResetCode(""); setStep(1); setPhoneStep("phone"); resetState(); };
  const switchMode = (m) => { setMode(m); setStep(1); setForgot(false); resetState(); setPassword(""); setPassword2(""); };

  return (
    <main className="page login">
      <div className="login__head">
        <div className="login__logo"><Logo size={52} /></div>
        <h1 className="login__title">«Время сдавать»</h1>
        <p className="login__subtitle">Сохраняйте прогресс, занимайтесь с ИИ и оформляйте подписку.</p>
      </div>

      <div className="login__tabs">
        {[["email", "Почта"], ["phone", "Телефон"]].map(([m, label]) => (
          <button key={m} onClick={() => switchMethod(m)} className={`login__tab${method === m ? " login__tab--active" : ""}`}>{label}</button>
        ))}
      </div>

      <div className="login__card">
        {method === "email" && !forgot && (
          <>
            <div className="login__modes">
              {[["login", "Вход"], ["register", "Регистрация"]].map(([m, label]) => (
                <button key={m} onClick={() => switchMode(m)} className={`login__mode${mode === m ? " login__mode--active" : ""}`}>{label}</button>
              ))}
            </div>

            {mode === "login" && (
              <div className="login__form">
                <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                <Field icon={Lock} type="password" value={password} placeholder="Пароль" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doLogin()} />
                <div className="login__forgot">
                  <button onClick={() => { setForgot(true); setForgotStep("request"); setResetCode(""); resetState(); setPassword(""); setPassword2(""); }} className="login__forgot-link">Забыли пароль?</button>
                </div>
                <Button onClick={doLogin} disabled={busy} style={submitBtn}>{busy ? "Входим…" : "Войти"}</Button>
              </div>
            )}

            {mode === "register" && step === 1 && (
              <div className="login__form">
                <Field icon={Mail} type="email" value={email} placeholder="you@example.com" autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
                <Field icon={Lock} type="password" value={password} placeholder="Пароль (от 6 символов)" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                <Field icon={Lock} type="password" value={password2} placeholder="Повторите пароль" autoComplete="new-password" onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nextStep()} />
                <Button onClick={nextStep} style={submitBtn}>Далее <ArrowRight size={16} /></Button>
              </div>
            )}
            {mode === "register" && step === 2 && (
              <div className="login__form">
                <div className="login__hint">Расскажите о себе:</div>
                <Field icon={User} type="text" value={name} placeholder="Имя" autoComplete="given-name" onChange={(e) => setName(cap(e.target.value))} />
                <Field icon={Calendar} type="number" value={age} placeholder="Возраст" min="7" max="100" onChange={(e) => setAge(e.target.value)} onKeyDown={(e) => e.key === "Enter" && nextToLevel()} />
                <Button onClick={nextToLevel} style={submitBtn}>Далее <ArrowRight size={16} /></Button>
                <button onClick={() => { setStep(1); resetState(); }} className="login__link">← Назад</button>
              </div>
            )}
            {mode === "register" && step === 3 && (
              <div className="login__form" style={{ gap: 12 }}>
                <div className="login__label">К какому экзамену готовитесь?</div>
                <LevelChoice value={level} onChange={setLevel} />
                <div className="login__hint login__hint--sm">Это можно изменить потом в настройках.</div>
                <Button onClick={doRegister} disabled={busy} style={submitBtn}>{busy ? "Создаём…" : "Создать аккаунт"}</Button>
                <button onClick={() => { setStep(2); resetState(); }} className="login__link">← Назад</button>
              </div>
            )}
          </>
        )}

        {method === "email" && forgot && (
          <div className="login__form">
            <div className="login__forgot-title">Восстановление пароля</div>
            {forgotStep === "request" && (
              <>
                <div className="login__hint">Укажите почту аккаунта — пришлём код для смены пароля.</div>
                <Field icon={Mail} type="email" value={email} placeholder="Почта аккаунта" autoComplete="email" onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doRequestCode()} />
                <Button onClick={doRequestCode} disabled={busy} style={submitBtn}>{busy ? "Отправляем…" : "Отправить код"}</Button>
              </>
            )}
            {forgotStep === "code" && (
              <>
                <Field icon={Lock} type="text" inputMode="numeric" maxLength={4} value={resetCode} placeholder="Код из письма (4 цифры)" onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))} />
                <Field icon={Lock} type="password" value={password} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" onChange={(e) => setPassword(e.target.value)} />
                <Field icon={Lock} type="password" value={password2} placeholder="Повторите новый пароль" autoComplete="new-password" onChange={(e) => setPassword2(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doResetCode()} />
                <Button onClick={doResetCode} disabled={busy} style={submitBtn}>{busy ? "Меняем…" : "Сменить пароль и войти"}</Button>
                <button onClick={() => { setForgotStep("request"); setResetCode(""); resetState(); }} className="login__link">← Изменить почту</button>
              </>
            )}
            <button onClick={() => { setForgot(false); setForgotStep("request"); setResetCode(""); resetState(); }} className="login__link">← Назад ко входу</button>
          </div>
        )}

        {method === "phone" && (
          <div className="login__form">
            {phoneStep === "phone" && (
              <>
                <Field icon={Phone} type="tel" value={phone} placeholder="+7 900 000-00-00" autoComplete="tel" onChange={(e) => setPhone(formatPhone(e.target.value))} onKeyDown={(e) => e.key === "Enter" && sendCode()} />
                <Button onClick={sendCode} disabled={busy} style={submitBtn}>{busy ? "Отправляем…" : "Получить код"}</Button>
              </>
            )}
            {phoneStep === "code" && (
              <>
                <Field icon={Lock} type="text" inputMode="numeric" maxLength={4} value={code} placeholder="Код из СМС (4 цифры)" onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && submitCode()} />
                <Button onClick={submitCode} disabled={busy} style={submitBtn}>{busy ? "Проверяем…" : "Подтвердить"}</Button>
                <button onClick={() => { setPhoneStep("phone"); setCode(""); resetState(); }} className="login__link">← Изменить номер</button>
              </>
            )}
            {phoneStep === "profile" && (
              <>
                <div className="login__hint">Вы впервые — расскажите о себе:</div>
                <Field icon={User} type="text" value={name} placeholder="Имя" onChange={(e) => setName(cap(e.target.value))} />
                <Field icon={Calendar} type="number" value={age} placeholder="Возраст" min="7" max="100" onChange={(e) => setAge(e.target.value)} />
                <div className="login__label login__label--sm">Какой экзамен?</div>
                <LevelChoice value={level} onChange={setLevel} />
                <Button onClick={submitPhoneProfile} disabled={busy} style={submitBtn}>{busy ? "Создаём…" : "Создать аккаунт"}</Button>
              </>
            )}
          </div>
        )}

        {info && <div className="login__info">{info}</div>}
        {err && <div className="login__err">{err}</div>}

        <div className="login__divider">
          <div className="login__divider-line" />
          <span className="login__divider-text">или</span>
          <div className="login__divider-line" />
        </div>
        <Button color="#0077FF" onClick={loginVK} style={{ width: "100%", justifyContent: "center", fontSize: 15.5, padding: "13px" }}>
          Войти через VK ID <ArrowRight size={17} />
        </Button>
      </div>

      <p className="login__legal">
        <ShieldCheck size={14} /> Продолжая, вы соглашаетесь с
        <a href="/legal/offer" className="login__legal-link">условиями</a> и
        <a href="/legal/privacy" className="login__legal-link">политикой</a>.
      </p>
    </main>
  );
}