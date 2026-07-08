import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { User, Lock, ShieldCheck, ArrowLeft, Check, Phone, GraduationCap, Palette, Sun, Moon, Monitor } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Settings.scss";

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
const Ok = ({ children }) => <span className="settings__ok"><Check size={14} /> {children}</span>;

function ThemePreview({ mode }) {
  if (mode === "system") {
    return (
      <div className="theme-preview theme-preview--system">
        <div className="theme-preview__half theme-preview__half--light">
          <div className="theme-preview__bar theme-preview__bar--accent" />
          <div className="theme-preview__bar theme-preview__bar--line" />
        </div>
        <div className="theme-preview__half theme-preview__half--dark">
          <div className="theme-preview__bar theme-preview__bar--accent-d" />
          <div className="theme-preview__bar theme-preview__bar--line-d" />
        </div>
      </div>
    );
  }
  const lineCls = mode === "dark" ? "theme-preview__bar--line-d" : "theme-preview__bar--line";
  const line2Cls = mode === "dark" ? "theme-preview__bar--line-d" : "theme-preview__bar--line2";
  return (
    <div className={`theme-preview theme-preview--${mode}`}>
      <div className="theme-preview__bar theme-preview__bar--accent" />
      <div className={`theme-preview__bar ${lineCls}`} />
      <div className={`theme-preview__bar ${line2Cls}`} />
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, updateName, changePassword, setTwoFactor, isEmailUser, addPhone, updateLevel } = useAuth();
  const { pref, setPref } = useTheme();

  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState("");
  const [oldPw, setOldPw] = useState(""); const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState(""); const [pwErr, setPwErr] = useState("");
  const [level, setLevel] = useState(user?.level || "ege");
  const [levelMsg, setLevelMsg] = useState("");
  const [phone, setPhone] = useState(user?.phone ? formatPhone(user.phone) : "");
  const [phoneMsg, setPhoneMsg] = useState(""); const [phoneErr, setPhoneErr] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/login?next=/settings" replace />;

  const saveName = async () => { try { await updateName(name); setNameMsg("Имя обновлено"); setTimeout(() => setNameMsg(""), 2500); } catch { /* ignore */ } };
  const savePw = async () => {
    setPwErr(""); setPwMsg("");
    try { await changePassword(oldPw, newPw); setPwMsg("Пароль изменён"); setOldPw(""); setNewPw(""); setTimeout(() => setPwMsg(""), 2500); }
    catch (e) { setPwErr(e.message === "bad_password" ? "Текущий пароль неверный" : e.message === "weak_password" ? "Новый пароль минимум 6 символов" : e.message === "network" ? "Сервер недоступен" : "Смена пароля доступна только для входа по почте"); }
  };
  const toggle2fa = async () => { try { await setTwoFactor(!user.twofa); } catch { /* ignore */ } };
  const saveLevel = async (lv) => { setLevel(lv); try { await updateLevel(lv); setLevelMsg("Уровень обновлён"); setTimeout(() => setLevelMsg(""), 2500); } catch { /* ignore */ } };
  const savePhone = async () => {
    setPhoneErr(""); setPhoneMsg("");
    if (phone.replace(/\D/g, "").length < 11) return setPhoneErr("Введите номер полностью");
    try { await addPhone(phone); setPhoneMsg("Номер привязан — теперь можно входить по нему"); setTimeout(() => setPhoneMsg(""), 3000); }
    catch (e) { setPhoneErr(e.message === "phone_taken" ? "Этот номер уже привязан к другому аккаунту" : e.message === "network" ? "Сервер недоступен" : "Не удалось привязать номер"); }
  };

  const NAV = [
    { id: "profile", label: "Профиль", Icon: User },
    { id: "level", label: "Уровень", Icon: GraduationCap },
    { id: "phone", label: "Телефон", Icon: Phone },
    { id: "password", label: "Пароль", Icon: Lock },
    { id: "security", label: "Безопасность", Icon: ShieldCheck },
    { id: "theme", label: "Тема", Icon: Palette },
  ];

  return (
    <main className="page settings">
      <button onClick={() => navigate("/progress")} className="settings__back"><ArrowLeft size={16} /> К прогрессу</button>
      <h1 className="settings__title">Настройки</h1>

      <div className="settings__grid">
        <nav className="settings__nav">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`settings__nav-btn${tab === id ? " settings__nav-btn--active" : ""}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <section className="settings__panel">
          {tab === "profile" && (<>
            <h2 className="settings__h">Имя</h2><p className="settings__desc">Как к вам обращаться в приложении.</p>
            <input className="settings__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
            <div className="settings__row"><Button onClick={saveName}>Сохранить</Button>{nameMsg && <Ok>{nameMsg}</Ok>}</div>
          </>)}

          {tab === "level" && (<>
            <h2 className="settings__h">Уровень подготовки</h2><p className="settings__desc">Влияет на тесты и предметы, которые вам показываются.</p>
            <div className="settings__choices">
              {[["ege", "ЕГЭ", "11 класс"], ["oge", "ОГЭ", "9 класс"]].map(([v, t, sub]) => (
                <button key={v} type="button" onClick={() => saveLevel(v)} className={`settings__choice${level === v ? " settings__choice--active" : ""}`}>
                  <div className="settings__choice-title">{t}</div>
                  <div className="settings__choice-sub">{sub}</div>
                </button>
              ))}
            </div>
            {levelMsg && <div style={{ marginTop: 12 }}><Ok>{levelMsg}</Ok></div>}
          </>)}

          {tab === "phone" && (<>
            <h2 className="settings__h">Номер телефона</h2>
            <p className="settings__desc">{user.phone ? "Номер привязан. По нему можно войти в этот аккаунт." : "Привяжите номер, чтобы входить по нему в этот же аккаунт."}</p>
            <input className="settings__input" type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 900 000-00-00" />
            <div className="settings__row"><Button onClick={savePhone}>{user.phone ? "Обновить номер" : "Привязать номер"}</Button>{phoneMsg && <Ok>{phoneMsg}</Ok>}</div>
            {phoneErr && <div className="settings__err">{phoneErr}</div>}
          </>)}

          {tab === "password" && (<>
            <h2 className="settings__h">Смена пароля</h2>
            <p className="settings__desc">{isEmailUser ? "Введите текущий и новый пароль." : "Доступно только для аккаунтов с входом по почте."}</p>
            {isEmailUser ? (<>
              <input className="settings__input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Текущий пароль" autoComplete="current-password" />
              <input className="settings__input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" />
              <div className="settings__row"><Button onClick={savePw}>Изменить</Button>{pwMsg && <Ok>{pwMsg}</Ok>}</div>
              {pwErr && <div className="settings__err">{pwErr}</div>}
            </>) : <div className="settings__muted">Пароль задаётся на стороне вашего сервиса входа (VK / телефон).</div>}
          </>)}

          {tab === "security" && (<>
            <h2 className="settings__h">Двухэтапная аутентификация</h2><p className="settings__desc">Дополнительный код при входе — надёжнее защищает аккаунт.</p>
            <label className="settings__toggle-label">
              <span onClick={toggle2fa} className={`settings__toggle${user.twofa ? " settings__toggle--on" : ""}`}>
                <span className="settings__toggle-knob" />
              </span>
              <span className="settings__toggle-text">{user.twofa ? "Включена" : "Выключена"}</span>
            </label>
            <p className="settings__note">В прототипе переключатель сохраняет выбор. Реальная доставка кодов (СМС / приложение-аутентификатор) подключается на сервере.</p>
          </>)}

          {tab === "theme" && (<>
            <h2 className="settings__h">Тема оформления</h2><p className="settings__desc">По умолчанию — как в системе. Можно выбрать вручную.</p>
            <div className="settings__themes">
              {[["light", "Светлая", Sun], ["dark", "Тёмная", Moon], ["system", "Системная", Monitor]].map(([v, t, Ic]) => (
                <button key={v} type="button" onClick={() => setPref(v)} className={`settings__theme${pref === v ? " settings__theme--active" : ""}`}>
                  <ThemePreview mode={v} />
                  <div className="settings__theme-label"><Ic size={15} /> {t}</div>
                </button>
              ))}
            </div>
          </>)}
        </section>
      </div>
    </main>
  );
}