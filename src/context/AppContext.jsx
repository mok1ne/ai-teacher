import { createContext, useContext, useState } from "react";
import { SUBJECTS } from "../data/subjects";
import { store, todayKey } from "../lib/storage";
import { FREE_DAILY_LIMIT } from "../config";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [results, setResults] = useState(null);      // { subjectKey, predicted, correct, total, weak, strong }
  const [studied, setStudied] = useState([]);        // изученные темы
  const [tutorTarget, setTutorTarget] = useState(null); // { topic, exam } | null (null = общий чат)

  // --- дата экзамена и уведомления (сохраняются между визитами) ---
  const [examDate, setExamDateState] = useState(() => store.get("vs_examDate", null));
  const [notifyEnabled, setNotifyState] = useState(() => store.get("vs_notify", false));
  const setExamDate = (d) => { setExamDateState(d); store.set("vs_examDate", d); };
  const setNotifyEnabled = (v) => { setNotifyState(v); store.set("vs_notify", v); };

  // --- дневной лимит сообщений к ИИ (бета) ---
  const [usage, setUsage] = useState(() => {
    const u = store.get("vs_usage", { date: todayKey(), count: 0 });
    return u.date === todayKey() ? u : { date: todayKey(), count: 0 };
  });
  const usedToday = usage.date === todayKey() ? usage.count : 0;
  const remaining = Math.max(0, FREE_DAILY_LIMIT - usedToday);
  const canSend = remaining > 0;
  function useOneMessage() {
    setUsage((prev) => {
      const today = todayKey();
      const base = prev.date === today ? prev : { date: today, count: 0 };
      const next = { date: today, count: base.count + 1 };
      store.set("vs_usage", next);
      return next;
    });
  }

  const markStudied = (t) => setStudied((s) => (s.includes(t) ? s : [...s, t]));
  const boostedScore = results ? Math.min(100, results.predicted + studied.length * 2) : 0;

  // краткая сводка для персональной поддержки в чате
  const studentSummary = results
    ? `Диагностика по предмету «${SUBJECTS[results.subjectKey]?.name}»: прогноз ~${boostedScore} баллов из 100. ` +
      `Сильные темы: ${results.strong.length ? results.strong.join(", ") : "—"}. ` +
      `Темы для улучшения: ${results.weak.length ? results.weak.join(", ") : "—"}.`
    : null;

  const value = {
    results, setResults, studied, markStudied, tutorTarget, setTutorTarget, boostedScore, studentSummary,
    examDate, setExamDate, notifyEnabled, setNotifyEnabled,
    remaining, limit: FREE_DAILY_LIMIT, canSend, useOneMessage,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
