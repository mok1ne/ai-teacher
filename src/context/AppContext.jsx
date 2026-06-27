import { createContext, useContext, useState } from "react";
import { SUBJECTS } from "../data/subjects";
import { store, todayKey } from "../lib/storage";

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
  const boostedScoreFor = (subjectKey) => {
    const r = resultsBySubject[subjectKey];
    return r ? Math.min(100, r.predicted + studiedFor(subjectKey).length * 2) : 0;
  };
  const studentSummaryFor = (subjectKey) => {
    const r = resultsBySubject[subjectKey];
    if (!r) return null;
    const s = SUBJECTS[subjectKey];
    return `Диагностика по предмету «${s?.name}»: прогноз ~${boostedScoreFor(subjectKey)} баллов из 100. ` +
      `Сильные темы: ${r.strong.length ? r.strong.join(", ") : "—"}. ` +
      `Темы для улучшения: ${r.weak.length ? r.weak.join(", ") : "—"}.`;
  };

  // --- дата экзамена и уведомления ---
  const [examDate, setExamDateState] = useState(() => store.get("vs_examDate", null));
  const [notifyEnabled, setNotifyState] = useState(() => store.get("vs_notify", false));
  const setExamDate = (d) => { setExamDateState(d); store.set("vs_examDate", d); };
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
    studiedFor, markStudied, boostedScoreFor, studentSummaryFor,
    tutorTarget, setTutorTarget,
    examDate, setExamDate, notifyEnabled, setNotifyEnabled,
    usedToday, useOneMessage,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
