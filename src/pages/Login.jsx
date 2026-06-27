import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";
  const { loginEmail, loginVK } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submitEmail = async () => {
    if (!/.+@.+\..+/.test(email)) { setErr("Введите корректную почту"); return; }
    setBusy(true); setErr("");
    try { await loginEmail(email); navigate(next); }
    catch { setErr("Не удалось войти. Проверьте, что бэкенд запущен (см. README)."); }
    finally { setBusy(false); }
  };

  return (
    <main className="page" style={{ maxWidth: 460, margin: "0 auto", padding: "54px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
          <Clock size={26} color="#fff" />
        </div>
        <h1 style={{ fontSize: 25, fontWeight: 800, margin: "0 0 6px" }}>Вход в «Время сдавать»</h1>
        <p style={{ fontSize: 14.5, color: C.mut, margin: 0 }}>Войдите, чтобы продолжить занятия, сохранять прогресс и оформить подписку.</p>
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${C.line}`, borderRadius: 12, padding: "11px 14px" }}>
            <Mail size={18} style={{ color: C.soft }} />
            <input type="email" value={email} placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitEmail()}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", color: C.ink, background: "transparent" }} />
          </div>
          <Button onClick={submitEmail} disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>
            {busy ? "Входим…" : "Продолжить"}
          </Button>
          {err && <div style={{ fontSize: 13, color: "#B91C1C" }}>{err}</div>}
        </div>
      </div>

      <p style={{ fontSize: 12, color: C.soft, marginTop: 16, textAlign: "center", lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <ShieldCheck size={14} /> Нажимая «Продолжить», вы соглашаетесь на обработку данных (152-ФЗ).
      </p>
    </main>
  );
}
