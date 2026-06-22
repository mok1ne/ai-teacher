import { useState } from "react";
import { CalendarClock, BellRing, CheckCircle2, Pencil } from "lucide-react";
import Button from "./ui/Button";
import { useApp } from "../context/AppContext";
import { daysUntil, pluralDays } from "../lib/date";
import { C } from "../theme";

/* Единый блок: если даты нет — форма ввода; если есть — таймер + «Изменить дату». */
export function ExamBlock() {
  const { examDate, setExamDate, setNotifyEnabled } = useApp();
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
      // современные браузеры возвращают Promise, старые — используют callback
      const r = Notification.requestPermission(applyPerm);
      if (r && typeof r.then === "function") r.then(applyPerm);
    } catch { setPerm("unsupported"); }
  };

  const save = () => { if (date) { setExamDate(date); setEditing(false); } };
  const cancel = () => { setDate(examDate); setEditing(false); };

  // ----- форма ввода/редактирования -----
  if (editing) {
    const notifLabel =
      perm === "granted" ? <><CheckCircle2 size={16} /> Уведомления включены</>
      : perm === "denied" ? <><BellRing size={16} /> Заблокировано в браузере</>
      : <><BellRing size={16} /> Разрешить напоминания</>;
    const notifColor = perm === "granted" ? C.green : C.purple;
    const notifDisabled = perm === "unsupported" || perm === "denied";

    return (
      <div style={{ background: "#fff", border: `1.5px solid ${C.blue}33`, borderRadius: 20, padding: "22px 24px", marginBottom: 24, boxShadow: "0 14px 40px -30px #0f172a66" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.blueBg, display: "grid", placeItems: "center" }}>
            <CalendarClock size={21} style={{ color: C.blue }} />
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{examDate ? "Изменить дату экзамена" : "Когда твой экзамен?"}</h3>
        </div>
        <p style={{ fontSize: 14, color: C.mut, margin: "0 0 14px" }}>
          Покажем, сколько дней осталось, и будем напоминать о подготовке — чтобы ты успел без спешки.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
            style={{ padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.line}`, fontSize: 15, fontFamily: "inherit", color: C.ink, outline: "none" }} />
          <Button variant="soft" color={notifColor} onClick={requestNotif} disabled={notifDisabled}>{notifLabel}</Button>
          <Button onClick={save} disabled={!date}>Сохранить</Button>
          {examDate && <Button variant="ghost" color={C.mut} onClick={cancel}>Отмена</Button>}
        </div>
        {perm === "denied" && (
          <p style={{ fontSize: 12.5, color: C.amberDk, margin: "10px 0 0" }}>
            Уведомления отключены в настройках браузера для этого сайта — разрешите их в адресной строке (значок 🔒). Таймер на странице будет виден в любом случае.
          </p>
        )}
        {perm === "unsupported" && (
          <p style={{ fontSize: 12.5, color: C.mut, margin: "10px 0 0" }}>
            Уведомления недоступны в этом режиме (нужен https или localhost). Таймер всё равно работает.
          </p>
        )}
      </div>
    );
  }

  // ----- таймер -----
  const d = daysUntil(examDate);
  const passed = d < 0;
  const urgent = d >= 0 && d <= 14;
  const accent = passed ? C.mut : urgent ? C.amberDk : C.blue;
  const bg = passed ? "#F1F5F9" : urgent ? C.creamBg : C.blueBg;

  return (
    <div style={{ background: bg, borderRadius: 16, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
      <CalendarClock size={26} style={{ color: accent, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {passed ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>Дата экзамена уже прошла — удачи на новом старте!</div>
        ) : d === 0 ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: accent }}>Экзамен сегодня — ты готовился, у тебя получится! 💪</div>
        ) : (
          <>
            <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>До экзамена {d} {pluralDays(d)}</div>
            <div style={{ fontSize: 13, color: C.mut }}>{urgent ? "Финишная прямая — занимайся понемногу каждый день." : "Есть время подготовиться спокойно. Главное — регулярность."}</div>
          </>
        )}
      </div>
      <Button size="sm" variant="soft" color={accent} onClick={() => { setDate(examDate); setEditing(true); }} style={{ flexShrink: 0 }}>
        <Pencil size={14} /> Изменить дату
      </Button>
    </div>
  );
}
