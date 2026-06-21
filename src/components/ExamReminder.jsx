import { useState } from "react";
import { CalendarClock, BellRing, CheckCircle2 } from "lucide-react";
import Button from "./ui/Button";
import { useApp } from "../context/AppContext";
import { daysUntil, pluralDays } from "../lib/date";
import { C } from "../theme";

/* Карточка после теста: спрашиваем дату экзамена и разрешение на уведомления. */
export function ExamSetup() {
  const { setExamDate, setNotifyEnabled } = useApp();
  const [date, setDate] = useState("");
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const today = new Date().toISOString().slice(0, 10);

  const requestNotif = async () => {
    if (typeof Notification === "undefined") return;
    try {
      const p = await Notification.requestPermission();
      setPerm(p);
      setNotifyEnabled(p === "granted");
    } catch { /* ignore */ }
  };
  const save = () => { if (date) setExamDate(date); };

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.blue}33`, borderRadius: 20, padding: "22px 24px", marginBottom: 24, boxShadow: "0 14px 40px -30px #0f172a66" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blueBg, display: "grid", placeItems: "center" }}>
          <CalendarClock size={21} style={{ color: C.blue }} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Когда твой экзамен?</h3>
      </div>
      <p style={{ fontSize: 14, color: C.mut, margin: "0 0 14px" }}>
        Покажем, сколько дней осталось, и будем напоминать о подготовке — чтобы ты успел без спешки.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
          style={{ padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: "inherit", color: C.ink, outline: "none" }} />
        <Button variant="soft" color={perm === "granted" ? C.green : C.purple} onClick={requestNotif} disabled={perm === "unsupported"}>
          {perm === "granted" ? <><CheckCircle2 size={16} /> Уведомления включены</> : <><BellRing size={16} /> Разрешить напоминания</>}
        </Button>
        <Button onClick={save} disabled={!date}>Сохранить</Button>
      </div>
      {perm === "denied" && (
        <p style={{ fontSize: 12.5, color: C.amberDk, margin: "10px 0 0" }}>
          Уведомления заблокированы в браузере — таймер всё равно будет виден на странице прогресса.
        </p>
      )}
    </div>
  );
}

/* Бейдж/карточка с обратным отсчётом до экзамена. */
export function ExamCountdown() {
  const { examDate } = useApp();
  const d = daysUntil(examDate);
  if (d == null) return null;

  const urgent = d <= 14;
  const passed = d < 0;
  const accent = passed ? C.mut : urgent ? C.amberDk : C.blue;
  const bg = passed ? "#F1F5F9" : urgent ? C.creamBg : C.blueBg;

  return (
    <div style={{ background: bg, borderRadius: 16, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <CalendarClock size={26} style={{ color: accent }} />
      <div>
        {passed ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>Дата экзамена уже прошла — удачи на пересдаче или новом старте!</div>
        ) : d === 0 ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>Экзамен сегодня — ты готовился, у тебя получится! 💪</div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>До экзамена {d} {pluralDays(d)}</div>
            <div style={{ fontSize: 13, color: C.mut }}>{urgent ? "Финишная прямая — занимайся понемногу каждый день." : "Есть время подготовиться спокойно. Главное — регулярность."}</div>
          </>
        )}
      </div>
    </div>
  );
}
