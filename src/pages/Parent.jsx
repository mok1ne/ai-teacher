import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { authHeaders } from "../lib/auth";
import { C } from "../theme";

export default function Parent() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { results, scoreFor, studiedFor } = useApp();
  const { user } = useAuth();
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(params.get("paid") === "1");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function buy() {
    if (!picked) return;
    if (!user) { navigate("/login?next=/parent"); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/payment/create", {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan: picked }),
      });
      const d = await r.json();
      if (d.confirmationUrl) { window.location.href = d.confirmationUrl; return; }
      setErr("Не удалось создать платёж. Проверьте, что бэкенд и ключи ЮKassa настроены (см. README).");
    } catch {
      setErr("Не удалось связаться с сервером оплаты.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <main className="page" style={{ maxWidth: 540, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: 20, background: C.mintBg, display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
          <CheckCircle2 size={38} style={{ color: C.green }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Спасибо за оформление!</h1>
        <p style={{ fontSize: 15.5, color: C.mut, lineHeight: 1.55, margin: "0 0 24px" }}>
          Если ключи ЮKassa настроены — подписка активируется после подтверждения платежа (через вебхук). Без ключей это демо-возврат, чтобы проверить весь путь.
        </p>
        <Button size="lg" onClick={() => navigate("/")}>На главную</Button>
      </main>
    );
  }

  if (!results) return <Navigate to="/test" replace />;
  const subject = SUBJECTS[results.subjectKey];
  const sc = scoreFor(results.subjectKey);
  const scoreLabel = sc.kind === "oge" ? `оценка ${sc.mark}` : sc.score;
  const scoreCaption = sc.kind === "oge" ? "ожидаемая оценка" : "тестовый балл";
  const studiedCount = studiedFor(results.subjectKey).length;

  const tariffs = [
    { name: "Базовый", price: 990, feats: ["1 предмет", "30 запросов в день", "Прогноз балла"], c: C.blue },
    { name: "Стандарт", price: 1990, feats: ["3 предмета", "Безлимит запросов", "Контроль прогресса"], c: C.purple, best: true },
    { name: "Премиум", price: 2990, feats: ["Все предметы", "Проверка сочинений", "Персональный план"], c: C.green },
  ];

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 20px 60px" }}>
      <button onClick={() => navigate("/progress")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mut, fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
        <ArrowLeft size={16} /> К прогрессу
      </button>

      {/* progress report card — the sales argument */}
      <div style={{ background: "linear-gradient(120deg,#EFF4FF,#F4EEFE)", border: `1px solid ${C.line}`, borderRadius: 20, padding: "22px 24px", marginBottom: 26 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.soft, textTransform: "uppercase" }}>Отчёт о прогрессе для родителя</div>
        <div style={{ display: "flex", gap: 26, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
          <div><div style={{ fontSize: 38, fontWeight: 800, color: C.blue }}>{scoreLabel}</div><div style={{ fontSize: 13, color: C.mut }}>{scoreCaption}</div></div>
          <div><div style={{ fontSize: 38, fontWeight: 800, color: C.green }}>{studiedCount}</div><div style={{ fontSize: 13, color: C.mut }}>тем разобрано</div></div>
          <div style={{ flex: 1, minWidth: 200, fontSize: 14.5, color: C.sub, lineHeight: 1.5 }}>
            Ребёнок уже занимается по предмету «{subject.name}» и видит реальный прогресс. Подписка открывает все предметы и проверку сочинений.
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", textAlign: "center" }}>Выберите тариф</h1>
      <p style={{ fontSize: 14.5, color: C.mut, textAlign: "center", margin: "0 0 24px" }}>Персональный репетитор по цене чашки кофе в день</p>

      <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {tariffs.map((t) => (
          <div key={t.name} onClick={() => setPicked(t.name)}
            style={{ background: "#fff", borderRadius: 18, padding: 22, cursor: "pointer", position: "relative",
              border: `2px solid ${picked === t.name ? t.c : t.best ? t.c + "55" : C.line}`,
              boxShadow: picked === t.name ? `0 14px 32px -18px ${t.c}` : "none", transition: "all .15s" }}>
            {t.best && <span style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: "#fff", background: t.c, padding: "3px 12px", borderRadius: 20 }}>Популярный</span>}
            <div style={{ fontSize: 16, fontWeight: 700, color: t.c }}>{t.name}</div>
            <div style={{ margin: "8px 0 14px" }}>
              <span style={{ fontSize: 30, fontWeight: 800 }}>{t.price}</span>
              <span style={{ fontSize: 14, color: C.mut }}> ₽/мес</span>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {t.feats.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.sub }}>
                  <CheckCircle2 size={15} style={{ color: t.c, flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Button size="lg" color={C.purple} disabled={!picked || busy} onClick={buy}>
          <ShieldCheck size={18} /> {busy ? "Создаём платёж…" : picked ? `Оформить «${picked}»` : "Выберите тариф"}
        </Button>
        {err && <p style={{ fontSize: 13, color: "#B91C1C", marginTop: 12 }}>{err}</p>}
        {!user && <p style={{ fontSize: 12.5, color: C.soft, marginTop: 10 }}>Для оформления нужен вход — мы предложим войти.</p>}
        <p style={{ fontSize: 12.5, color: C.soft, marginTop: 12, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
          Оформляя подписку, родитель даёт согласие на обработку персональных данных ребёнка (152-ФЗ). Оплата через ЮKassa.
        </p>
      </div>
    </main>
  );
}
