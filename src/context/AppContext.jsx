import { createContext, useContext, useState } from "react";
import { SUBJECTS } from "../data/subjects";
import { store, todayKey } from "../lib/storage";
import { estimateScore } from "../lib/scoring";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // результаты и прогресс — ПО КАЖДОМУ ПРЕДМЕТУ отдельно (сохраняются между визитами)
  const [resultsBySubject, setResultsBySubjectState] = useState(() => store.get("vs_results", {}));
  const [studiedBySubject, setStudiedBySubjectState] = useState(() => store.get("vs_studied", {}));
  const [lastSubjectKey, setLastSubjectKeyState] = useState(() => store.get("vs_lastSubject", null));
  const [tutorTarget, setTutorTarget] = useState(null); // { topic, exam, subjectKey } | null

  const persist = (key, val) => store.set(key, val);

  const setResults = (r) => {
    setResultsBySubjectState((m) => { const n = { ...m, [r.subjectKey]: r }; persist("vs_results", n); return n; });
    setLastSubjectKeyState(r.subjectKey); persist("vs_lastSubject", r.subjectKey);
  };
  const results = lastSubjectKey ? resultsBySubject[lastSubjectKey] : null;

  const studiedFor = (subjectKey) => studiedBySubject[subjectKey] || [];
  const markStudied = (subjectKey, topic) => {
    setStudiedBySubjectState((m) => {
      const arr = m[subjectKey] || [];
      if (arr.includes(topic)) return m;
      const n = { ...m, [subjectKey]: [...arr, topic] };
      persist("vs_studied", n); return n;
    });
  };
  // оценка по реальной шкале уровня (ЕГЭ — балл, ОГЭ — оценка), с учётом разобранных тем
  const scoreFor = (subjectKey) => {
    const r = resultsBySubject[subjectKey];
    if (!r) return null;
    // первичный балл = сумма весов верных (fallback на старые записи без primary)
    const primary = r.primary != null ? r.primary : (r.correct || 0);
    return estimateScore(subjectKey, r.levelKey, primary, studiedFor(subjectKey).length);
  };
  const studentSummaryFor = (subjectKey) => {
    const r = resultsBySubject[subjectKey];
    if (!r) return null;
    const s = SUBJECTS[subjectKey];
    const sc = scoreFor(subjectKey);
    const res = sc.kind === "oge" ? `ожидаемая оценка ${sc.mark} из 5 (${sc.primary} из ${sc.max} первичных)` : `прогноз ~${sc.score} тестовых баллов из 100`;
    return `Диагностика по предмету «${s?.name}» (${s?.level}): ${res}. ` +
      `Сильные темы: ${r.strong.length ? r.strong.join(", ") : "—"}. ` +
      `Темы для улучшения: ${r.weak.length ? r.weak.join(", ") : "—"}.`;
  };

  // --- даты экзамена ПО ПРЕДМЕТАМ и уведомления ---
  const [examDates, setExamDatesState] = useState(() => store.get("vs_examDates", {}));
  const [notifyEnabled, setNotifyState] = useState(() => store.get("vs_notify", false));
  const examDateFor = (subjectKey) => examDates[subjectKey] || null;
  const setExamDate = (subjectKey, d) => {
    setExamDatesState((m) => { const n = { ...m, [subjectKey]: d }; store.set("vs_examDates", n); return n; });
  };
  const setNotifyEnabled = (v) => { setNotifyState(v); store.set("vs_notify", v); };

  // --- дневной лимит сообщений (клиентский счётчик; сервер — главный страж) ---
  const [usage, setUsage] = useState(() => {
    const u = store.get("vs_usage", { date: todayKey(), count: 0 });
    return u.date === todayKey() ? u : { date: todayKey(), count: 0 };
  });
  const usedToday = usage.date === todayKey() ? usage.count : 0;
  function useOneMessage() {
    setUsage((prev) => {
      const today = todayKey();
      const base = prev.date === today ? prev : { date: today, count: 0 };
      const next = { date: today, count: base.count + 1 };
      store.set("vs_usage", next);
      return next;
    });
  }

  const value = {
    resultsBySubject, results, lastSubjectKey, setResults,
    studiedFor, markStudied, scoreFor, studentSummaryFor,
    tutorTarget, setTutorTarget,
    examDates, examDateFor, setExamDate, notifyEnabled, setNotifyEnabled,
    usedToday, useOneMessage,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
