import { useState } from "react";
import { CalendarClock, BellRing, CheckCircle2, Pencil } from "lucide-react";
import Button from "./ui/Button";
import { useApp } from "../context/AppContext";
import { SUBJECTS } from "../data/subjects";
import { daysUntil, pluralDays } from "../lib/date";
import { C } from "../theme";
import "./ExamReminder.scss";

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
      <div className="exam-edit">
        <div className="exam-edit__head">
          <CalendarClock size={20} className="exam-edit__icon" />
          <h3 className="exam-edit__title">
            {examDate ? "Изменить дату экзамена" : "Когда экзамен"}{subjectName ? ` по предмету «${subjectName}»?` : "?"}
          </h3>
        </div>
        <p className="exam-edit__desc">Покажем обратный отсчёт и будем напоминать о подготовке.</p>
        <div className="exam-edit__row">
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="exam-edit__input" />
          <Button size="sm" variant="soft" color={perm === "granted" ? C.green : C.purple} onClick={requestNotif} disabled={notifDisabled}>{notifLabel}</Button>
          <Button size="sm" onClick={save} disabled={!date}>Сохранить</Button>
          {examDate && <Button size="sm" variant="ghost" color={C.mut} onClick={cancel}>Отмена</Button>}
        </div>
        {perm === "denied" && (
          <p className="exam-edit__note exam-edit__note--warn">
            Уведомления отключены для сайта в браузере — включите их в адресной строке (🔒). Таймер всё равно виден.
          </p>
        )}
        {perm === "unsupported" && (
          <p className="exam-edit__note exam-edit__note--muted">
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
  const mod = passed ? " exam-timer--passed" : urgent ? " exam-timer--urgent" : "";

  return (
    <div className={`exam-timer${mod}`}>
      <CalendarClock size={24} className="exam-timer__icon" />
      <div className="exam-timer__main">
        {passed ? (
          <div className="exam-timer__line">Дата экзамена прошла — удачи на новом старте!</div>
        ) : d === 0 ? (
          <div className="exam-timer__line">Экзамен сегодня — у тебя получится! 💪</div>
        ) : (
          <>
            <div className="exam-timer__big">До экзамена {d} {pluralDays(d)}</div>
            <div className="exam-timer__sub">{urgent ? "Финишная прямая — занимайся понемногу каждый день." : "Есть время подготовиться спокойно."}</div>
          </>
        )}
      </div>
      <Button size="sm" variant="soft" color={accent} onClick={() => { setDate(examDate); setEditing(true); }} style={{ flexShrink: 0 }}>
        <Pencil size={14} /> Изменить
      </Button>
    </div>
  );
}