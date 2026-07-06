import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { User, Lock, ShieldCheck, ArrowLeft, Check, Phone, GraduationCap, Palette, Sun, Moon, Monitor } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { C } from "../theme";

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
const inputStyle = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.line}`, borderRadius: 11, padding: "11px 13px", fontSize: 14.5, fontFamily: "inherit", color: C.ink, outline: "none", marginBottom: 10, background: C.card };
const ok = (t) => <span style={{ fontSize: 13, color: C.greenDk, display: "flex", alignItems: "center", gap: 4 }}><Check size={14} /> {t}</span>;

function ThemePreview({ mode }) {
  const bg = mode === "dark" ? "#0B1020" : "#FFFFFF";
  const bar = mode === "dark" ? "#2A3450" : "#E6EAF2";
  const dot = "#7C3AED";
  if (mode === "system") {
    return (
      <div style={{ height: 54, borderRadius: 10, overflow: "hidden", display: "flex", border: `1px solid ${C.line}` }}>
        <div style={{ flex: 1, background: "#FFFFFF", padding: 8 }}><div style={{ width: 20, height: 5, borderRadius: 3, background: "#7C3AED" }} /><div style={{ width: 30, height: 4, borderRadius: 3, background: "#E6EAF2", marginTop: 5 }} /></div>
        <div style={{ flex: 1, background: "#0B1020", padding: 8 }}><div style={{ width: 20, height: 5, borderRadius: 3, background: "#A276FF" }} /><div style={{ width: 30, height: 4, borderRadius: 3, background: "#2A3450", marginTop: 5 }} /></div>
      </div>
    );
  }
  return (
    <div style={{ height: 54, borderRadius: 10, background: bg, border: `1px solid ${C.line}`, padding: 9 }}>
      <div style={{ width: 22, height: 5, borderRadius: 3, background: dot }} />
      <div style={{ width: 34, height: 4, borderRadius: 3, background: bar, marginTop: 6 }} />
      <div style={{ width: 26, height: 4, borderRadius: 3, background: bar, marginTop: 5 }} />
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

  const H = ({ children }) => <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>{children}</h2>;
  const D = ({ children }) => <p style={{ fontSize: 13.5, color: C.mut, margin: "0 0 18px" }}>{children}</p>;

  return (
    <main className="page" style={{ maxWidth: 900, margin: "0 auto", padding: "30px 20px 60px" }}>
      <button onClick={() => navigate("/progress")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mut, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
        <ArrowLeft size={16} /> К прогрессу
      </button>
      <h1 style={{ fontSize: 27, fontWeight: 800, margin: "0 0 20px" }}>Настройки</h1>

      <div className="settings-grid">
        <nav className="settings-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: 600, textAlign: "left",
                background: tab === id ? C.lavBg : "transparent", color: tab === id ? C.purple : C.sub }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>

        <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, minHeight: 260 }}>
          {tab === "profile" && (<>
            <H>Имя</H><D>Как к вам обращаться в приложении.</D>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Button onClick={saveName}>Сохранить</Button>{nameMsg && ok(nameMsg)}</div>
          </>)}

          {tab === "level" && (<>
            <H>Уровень подготовки</H><D>Влияет на тесты и предметы, которые вам показываются.</D>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["ege", "ЕГЭ", "11 класс"], ["oge", "ОГЭ", "9 класс"]].map(([v, t, sub]) => (
                <button key={v} type="button" onClick={() => saveLevel(v)}
                  style={{ padding: "16px", borderRadius: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit", background: level === v ? C.lavBg : C.card, border: `2px solid ${level === v ? C.purple : C.line}` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: level === v ? C.purple : C.ink }}>{t}</div>
                  <div style={{ fontSize: 12, color: C.mut }}>{sub}</div>
                </button>
              ))}
            </div>
            {levelMsg && <div style={{ marginTop: 12 }}>{ok(levelMsg)}</div>}
          </>)}

          {tab === "phone" && (<>
            <H>Номер телефона</H><D>{user.phone ? "Номер привязан. По нему можно войти в этот аккаунт." : "Привяжите номер, чтобы входить по нему в этот же аккаунт."}</D>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 900 000-00-00" />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Button onClick={savePhone}>{user.phone ? "Обновить номер" : "Привязать номер"}</Button>{phoneMsg && ok(phoneMsg)}</div>
            {phoneErr && <div style={{ fontSize: 13, color: "#DC2626", marginTop: 10 }}>{phoneErr}</div>}
          </>)}

          {tab === "password" && (<>
            <H>Смена пароля</H><D>{isEmailUser ? "Введите текущий и новый пароль." : "Доступно только для аккаунтов с входом по почте."}</D>
            {isEmailUser ? (<>
              <input style={inputStyle} type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Текущий пароль" autoComplete="current-password" />
              <input style={inputStyle} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}><Button onClick={savePw}>Изменить</Button>{pwMsg && ok(pwMsg)}</div>
              {pwErr && <div style={{ fontSize: 13, color: "#DC2626", marginTop: 10 }}>{pwErr}</div>}
            </>) : <div style={{ fontSize: 13.5, color: C.soft }}>Пароль задаётся на стороне вашего сервиса входа (VK / телефон).</div>}
          </>)}

          {tab === "security" && (<>
            <H>Двухэтапная аутентификация</H><D>Дополнительный код при входе — надёжнее защищает аккаунт.</D>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <span onClick={toggle2fa} style={{ width: 46, height: 26, borderRadius: 20, background: user.twofa ? C.green : C.line, position: "relative", transition: "background .2s", flexShrink: 0 }}>
                <span style={{ position: "absolute", top: 3, left: user.twofa ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px #0003" }} />
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>{user.twofa ? "Включена" : "Выключена"}</span>
            </label>
            <p style={{ fontSize: 12, color: C.soft, marginTop: 12, lineHeight: 1.5 }}>В прототипе переключатель сохраняет выбор. Реальная доставка кодов (СМС / приложение-аутентификатор) подключается на сервере.</p>
          </>)}

          {tab === "theme" && (<>
            <H>Тема оформления</H><D>По умолчанию — как в системе. Можно выбрать вручную.</D>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[["light", "Светлая", Sun], ["dark", "Тёмная", Moon], ["system", "Системная", Monitor]].map(([v, t, Ic]) => (
                <button key={v} type="button" onClick={() => setPref(v)}
                  style={{ padding: 10, borderRadius: 15, cursor: "pointer", fontFamily: "inherit", background: C.card, border: `2px solid ${pref === v ? C.purple : C.line}`, transition: "border-color .15s" }}>
                  <ThemePreview mode={v} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, fontSize: 13.5, fontWeight: 700, color: pref === v ? C.purple : C.ink }}>
                    <Ic size={15} /> {t}
                  </div>
                </button>
              ))}
            </div>
          </>)}
        </section>
      </div>
    </main>
  );
}
