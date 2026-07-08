import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { authHeaders } from "../lib/auth";
import { C } from "../theme";
import "./Parent.scss";

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
      const r = await fetch("/api/payment?action=create", {
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
      <main className="page pay-done">
        <div className="pay-done__icon"><CheckCircle2 size={38} style={{ color: C.green }} /></div>
        <h1 className="pay-done__title">Спасибо за оформление!</h1>
        <p className="pay-done__text">
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
    <main className="page parent">
      <button onClick={() => navigate("/progress")} className="parent__back"><ArrowLeft size={16} /> К прогрессу</button>

      <div className="parent__report">
        <div className="parent__report-label">Отчёт о прогрессе для родителя</div>
        <div className="parent__report-row">
          <div><div className="parent__stat-num parent__stat-num--blue">{scoreLabel}</div><div className="parent__stat-cap">{scoreCaption}</div></div>
          <div><div className="parent__stat-num parent__stat-num--green">{studiedCount}</div><div className="parent__stat-cap">тем разобрано</div></div>
          <div className="parent__report-text">
            Ребёнок уже занимается по предмету «{subject.name}» и видит реальный прогресс. Подписка открывает все предметы и проверку сочинений.
          </div>
        </div>
      </div>

      <h1 className="parent__title">Выберите тариф</h1>
      <p className="parent__subtitle">Персональный репетитор по цене чашки кофе в день</p>

      <div className="parent__grid">
        {tariffs.map((t) => (
          <div key={t.name} onClick={() => setPicked(t.name)}
            className={`tariff${picked === t.name ? " tariff--picked" : t.best ? " tariff--best" : ""}`}
            style={{ "--t-color": t.c }}>
            {t.best && <span className="tariff__badge">Популярный</span>}
            <div className="tariff__name">{t.name}</div>
            <div className="tariff__price">
              <span className="tariff__price-num">{t.price}</span>
              <span className="tariff__price-per"> ₽/мес</span>
            </div>
            <div className="tariff__feats">
              {t.feats.map((f) => (
                <div key={f} className="tariff__feat"><CheckCircle2 size={15} style={{ color: t.c, flexShrink: 0 }} /> {f}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="parent__cta">
        <Button size="lg" color={C.purple} disabled={!picked || busy} onClick={buy}>
          <ShieldCheck size={18} /> {busy ? "Создаём платёж…" : picked ? `Оформить «${picked}»` : "Выберите тариф"}
        </Button>
        {err && <p className="parent__error">{err}</p>}
        {!user && <p className="parent__note">Для оформления нужен вход — мы предложим войти.</p>}
        <p className="parent__legal">
          Оформляя подписку, родитель даёт согласие на обработку персональных данных ребёнка (152-ФЗ). Оплата через ЮKassa.
        </p>
      </div>
    </main>
  );
}