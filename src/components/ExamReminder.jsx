import { useState } from "react";
import { CalendarClock, BellRing, CheckCircle2, Pencil } from "lucide-react";
import Button from "./ui/Button";
import { useApp } from "../context/AppContext";
import { SUBJECTS } from "../data/subjects";
import { daysUntil, pluralDays } from "../lib/date";
import { C } from "../theme";

/* Дата экзамена для КОНКРЕТНОГО предмета: ввод/редактирование + таймер. */
export function ExamBlock({ subjectKey }) {
  const { examDateFor, setExamDate, setNotifyEnabled } = useApp();
  const examDate = examDateFor(subjectKey);
  const subjectName = SUBJECTS[subjectKey]?.name || "";
  const [editing, setEditing] = useState(!examDate);
  const [date, setDate] = useState(examDate || "");
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const today = new Date().toISOString().slice(0, 10);

  const applyPerm = (p) => {
    setPerm(p);
    setNotifyEnabled(p === "granted");
    if (p === "granted") {
      try { new Notification("Время сдавать", { body: "Готово! Будем напоминать о подготовке к экзамену." }); } catch { /* ignore */ }
    }
  };
  const requestNotif = () => {
    if (typeof Notification === "undefined") { setPerm("unsupported"); return; }
    try {
      const r = Notification.requestPermission(applyPerm);
      if (r && typeof r.then === "function") r.then(applyPerm);
    } catch { setPerm("unsupported"); }
  };

  const save = () => { if (date) { setExamDate(subjectKey, date); setEditing(false); } };
  const cancel = () => { setDate(examDate); setEditing(false); };

  if (editing) {
    const notifLabel =
      perm === "granted" ? <><CheckCircle2 size={16} /> Уведомления включены</>
      : perm === "denied" ? <><BellRing size={16} /> Заблокировано в браузере</>
      : <><BellRing size={16} /> Разрешить напоминания</>;
    const notifDisabled = perm === "unsupported" || perm === "denied";

    return (
      <div style={{ background: "#fff", border: `1.5px solid ${C.blue}33`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <CalendarClock size={20} style={{ color: C.blue }} />
          <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 700 }}>
            {examDate ? "Изменить дату экзамена" : "Когда экзамен"}{subjectName ? ` по предмету «${subjectName}»?` : "?"}
          </h3>
        </div>
        <p style={{ fontSize: 13.5, color: C.mut, margin: "0 0 12px" }}>
          Покажем обратный отсчёт и будем напоминать о подготовке.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
            style={{ padding: "10px 13px", borderRadius: 11, border: `1.5px solid ${C.line}`, fontSize: 14.5, fontFamily: "inherit", color: C.ink, outline: "none" }} />
          <Button size="sm" variant="soft" color={perm === "granted" ? C.green : C.purple} onClick={requestNotif} disabled={notifDisabled}>{notifLabel}</Button>
          <Button size="sm" onClick={save} disabled={!date}>Сохранить</Button>
          {examDate && <Button size="sm" variant="ghost" color={C.mut} onClick={cancel}>Отмена</Button>}
        </div>
        {perm === "denied" && (
          <p style={{ fontSize: 12, color: C.amberDk, margin: "8px 0 0" }}>
            Уведомления отключены для сайта в браузере — включите их в адресной строке (🔒). Таймер всё равно виден.
          </p>
        )}
        {perm === "unsupported" && (
          <p style={{ fontSize: 12, color: C.mut, margin: "8px 0 0" }}>
            Уведомления недоступны в этом режиме (нужен https или localhost). Таймер всё равно работает.
          </p>
        )}
      </div>
    );
  }

  const d = daysUntil(examDate);
  const passed = d < 0;
  const urgent = d >= 0 && d <= 14;
  const accent = passed ? C.mut : urgent ? C.amberDk : C.blue;
  const bg = passed ? "#F1F5F9" : urgent ? C.creamBg : C.blueBg;

  return (
    <div style={{ background: bg, borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <CalendarClock size={24} style={{ color: accent, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {passed ? (
          <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Дата экзамена прошла — удачи на новом старте!</div>
        ) : d === 0 ? (
          <div style={{ fontSize: 15, fontWeight: 700, color: accent }}>Экзамен сегодня — у тебя получится! 💪</div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>До экзамена {d} {pluralDays(d)}</div>
            <div style={{ fontSize: 12.5, color: C.mut }}>{urgent ? "Финишная прямая — занимайся понемногу каждый день." : "Есть время подготовиться спокойно."}</div>
          </>
        )}
      </div>
      <Button size="sm" variant="soft" color={accent} onClick={() => { setDate(examDate); setEditing(true); }} style={{ flexShrink: 0 }}>
        <Pencil size={14} /> Изменить
      </Button>
    </div>
  );
}
