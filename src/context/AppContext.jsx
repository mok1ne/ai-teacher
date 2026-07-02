import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "../data/subjects";
import { todayKey } from "../lib/storage";
import { estimateScore } from "../lib/scoring";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

/* Результаты тестов привязаны к аккаунту:
   - вошёл в аккаунт  → результаты хранятся в localStorage по его id (сохраняются);
   - без аккаунта     → результаты живут только в текущей сессии (sessionStorage);
   - при входе и выходе анонимные результаты очищаются. */
const BASES = ["vs_results", "vs_studied", "vs_examDates", "vs_lastSubject"];
const storageFor = (uid) => (uid === "anon" ? window.sessionStorage : window.localStorage);
const nsKey = (base, uid) => `${base}:${uid}`;

function loadFor(uid) {
  const s = storageFor(uid);
  const get = (base, def) => { try { const v = s.getItem(nsKey(base, uid)); return v == null ? def : JSON.parse(v); } catch { return def; } };
  return {
    results: get("vs_results", {}),
    studied: get("vs_studied", {}),
    examDates: get("vs_examDates", {}),
    lastSubject: get("vs_lastSubject", null),
  };
}
function clearAnon() {
  try { BASES.forEach((b) => window.sessionStorage.removeItem(nsKey(b, "anon"))); } catch { /* ignore */ }
}
// одноразовая очистка старых (не привязанных к аккаунту) ключей
function clearLegacy() {
  try { BASES.forEach((b) => window.localStorage.removeItem(b)); } catch { /* ignore */ }
}

export function AppProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const uid = user?.id || "anon";
  const uidRef = useRef(uid); uidRef.current = uid;
  const prevUidRef = useRef(null);

  const [resultsBySubject, setResultsBySubjectState] = useState({});
  const [studiedBySubject, setStudiedBySubjectState] = useState({});
  const [examDates, setExamDatesState] = useState({});
  const [lastSubjectKey, setLastSubjectKeyState] = useState(null);
  const [tutorTarget, setTutorTarget] = useState(null);

  useEffect(() => { clearLegacy(); }, []);

  // загрузка/очистка результатов при смене аккаунта
  useEffect(() => {
    if (authLoading) return;
    const prev = prevUidRef.current;
    if (prev === uid) return;
    // Реальная смена (вход/выход) — анонимную сессию не переносим.
    if (prev !== null || uid !== "anon") clearAnon();
    const data = loadFor(uid);
    setResultsBySubjectState(data.results);
    setStudiedBySubjectState(data.studied);
    setExamDatesState(data.examDates);
    setLastSubjectKeyState(data.lastSubject);
    prevUidRef.current = uid;
  }, [uid, authLoading]);

  const persist = (base, val) => { try { storageFor(uidRef.current).setItem(nsKey(base, uidRef.current), JSON.stringify(val)); } catch { /* ignore */ } };

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

  const scoreFor = (subjectKey) => {
    const r = resultsBySubject[subjectKey];
    if (!r) return null;
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

  // --- даты экзамена по предметам ---
  const examDateFor = (subjectKey) => examDates[subjectKey] || null;
  const setExamDate = (subjectKey, d) => {
    setExamDatesState((m) => { const n = { ...m, [subjectKey]: d }; persist("vs_examDates", n); return n; });
  };

  // уведомления и дневной лимит — общие (не зависят от аккаунта)
  const [notifyEnabled, setNotifyState] = useState(() => { try { return JSON.parse(localStorage.getItem("vs_notify") || "false"); } catch { return false; } });
  const setNotifyEnabled = (v) => { setNotifyState(v); try { localStorage.setItem("vs_notify", JSON.stringify(v)); } catch { /* ignore */ } };

  const [usage, setUsage] = useState(() => {
    try { const u = JSON.parse(localStorage.getItem("vs_usage") || "null"); if (u && u.date === todayKey()) return u; } catch { /* ignore */ }
    return { date: todayKey(), count: 0 };
  });
  const usedToday = usage.date === todayKey() ? usage.count : 0;
  function useOneMessage() {
    setUsage((prev) => {
      const today = todayKey();
      const base = prev.date === today ? prev : { date: today, count: 0 };
      const next = { date: today, count: base.count + 1 };
      try { localStorage.setItem("vs_usage", JSON.stringify(next)); } catch { /* ignore */ }
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