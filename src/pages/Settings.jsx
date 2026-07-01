import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { User, Lock, ShieldCheck, ArrowLeft, Check } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

function Card({ icon: Icon, title, desc, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: C.lavBg, display: "grid", placeItems: "center" }}>
          <Icon size={18} style={{ color: C.purple }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      {desc && <p style={{ fontSize: 13, color: C.mut, margin: "0 0 12px 44px" }}>{desc}</p>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
const inputStyle = { width: "100%", boxSizing: "border-box", border: `1.5px solid ${C.line}`, borderRadius: 11, padding: "11px 13px", fontSize: 14.5, fontFamily: "inherit", color: C.ink, outline: "none", marginBottom: 10 };

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading, updateName, changePassword, setTwoFactor, isEmailUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState("");
  const [oldPw, setOldPw] = useState(""); const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState(""); const [pwErr, setPwErr] = useState("");

  if (loading) return null;
  if (!user) return <Navigate to="/login?next=/settings" replace />;

  const saveName = async () => {
    try { await updateName(name); setNameMsg("Имя обновлено"); setTimeout(() => setNameMsg(""), 2500); }
    catch { setNameMsg(""); }
  };
  const savePw = async () => {
    setPwErr(""); setPwMsg("");
    try {
      await changePassword(oldPw, newPw);
      setPwMsg("Пароль изменён"); setOldPw(""); setNewPw(""); setTimeout(() => setPwMsg(""), 2500);
    } catch (e) {
      setPwErr(e.message === "bad_password" ? "Текущий пароль неверный" :
        e.message === "weak_password" ? "Новый пароль минимум 6 символов" :
        e.message === "network" ? "Сервер недоступен" :
        "Смена пароля доступна только для входа по почте");
    }
  };
  const toggle2fa = async () => { try { await setTwoFactor(!user.twofa); } catch { /* ignore */ } };

  return (
    <main className="page" style={{ maxWidth: 620, margin: "0 auto", padding: "30px 20px 60px" }}>
      <button onClick={() => navigate("/progress")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mut, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
        <ArrowLeft size={16} /> К прогрессу
      </button>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 20px" }}>Настройки</h1>

      <Card icon={User} title="Имя" desc="Как к вам обращаться в приложении.">
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button onClick={saveName}>Сохранить имя</Button>
          {nameMsg && <span style={{ fontSize: 13, color: C.greenDk, display: "flex", alignItems: "center", gap: 4 }}><Check size={14} /> {nameMsg}</span>}
        </div>
      </Card>

      <Card icon={Lock} title="Смена пароля" desc={isEmailUser ? "Введите текущий и новый пароль." : "Доступно только для аккаунтов с входом по почте (у вас вход через VK)."}>
        {isEmailUser ? (
          <>
            <input style={inputStyle} type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Текущий пароль" autoComplete="current-password" />
            <input style={inputStyle} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Новый пароль (от 6 символов)" autoComplete="new-password" />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button onClick={savePw}>Изменить пароль</Button>
              {pwMsg && <span style={{ fontSize: 13, color: C.greenDk, display: "flex", alignItems: "center", gap: 4 }}><Check size={14} /> {pwMsg}</span>}
            </div>
            {pwErr && <div style={{ fontSize: 13, color: "#B91C1C", marginTop: 10 }}>{pwErr}</div>}
          </>
        ) : (
          <div style={{ fontSize: 13.5, color: C.soft }}>Пароль задаётся на стороне VK ID.</div>
        )}
      </Card>

      <Card icon={ShieldCheck} title="Двухэтапная аутентификация (2FA)" desc="Дополнительный код при входе — надёжнее защищает аккаунт.">
        <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
          <span
            onClick={toggle2fa}
            style={{ width: 46, height: 26, borderRadius: 20, background: user.twofa ? C.green : C.line, position: "relative", transition: "background .2s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: user.twofa ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px #0003" }} />
          </span>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{user.twofa ? "Включена" : "Выключена"}</span>
        </label>
        <p style={{ fontSize: 12, color: C.soft, marginTop: 12, lineHeight: 1.5 }}>
          В прототипе переключатель сохраняет ваш выбор. Реальная доставка кодов (SMS / приложение-аутентификатор) подключается на сервере.
        </p>
      </Card>
    </main>
  );
}
