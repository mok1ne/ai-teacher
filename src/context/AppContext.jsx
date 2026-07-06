import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SUBJECTS } from "../data/subjects";
import { estimateScore } from "../lib/scoring";
import { getToken, authHeaders } from "../lib/auth";
import { useAuth } from "./AuthContext";

const AppContext = createContext(null);

/* Результаты тестов:
   - вошёл в аккаунт → хранятся на сервере (Neon) + локальный кэш по id;
   - без аккаунта → только текущая сессия (sessionStorage);
   - при входе/выходе анонимные результаты очищаются. */
const BASES = ["vs_results", "vs_studied", "vs_examDates", "vs_lastSubject"];
const safeStore = (name) => { try { return window[name] || null; } catch { return null; } };
const storageFor = (uid) => safeStore(uid === "anon" ? "sessionStorage" : "localStorage");
const nsKey = (base, uid) => `${base}:${uid}`;
const isDemo = () => { const t = getToken(); return !!t && t.startsWith("demo."); };
const isServerUser = (uid) => uid !== "anon" && !isDemo();

const weekKey = () => {
  const d = new Date();
  const o = new Date(d.getFullYear(), 0, 1);
  const w = Math.ceil(((d - o) / 86400000 + o.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${w}`;
};

function loadFor(uid) {
  const s = storageFor(uid);
  const get = (base, def) => { if (!s) return def; try { const v = s.getItem(nsKey(base, uid)); return v == null ? def : JSON.parse(v); } catch { return def; } };
  return { results: get("vs_results", {}), studied: get("vs_studied", {}), examDates: get("vs_examDates", {}), lastSubject: get("vs_lastSubject", null) };
}
function clearAnon() { try { const s = safeStore("sessionStorage"); if (s) BASES.forEach((b) => s.removeItem(nsKey(b, "anon"))); } catch { /* ignore */ } }
function clearLegacy() { try { const s = safeStore("localStorage"); if (s) BASES.forEach((b) => s.removeItem(b)); } catch { /* ignore */ } }

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

  const resultsRef = useRef(resultsBySubject); resultsRef.current = resultsBySubject;
  const studiedRef = useRef(studiedBySubject); studiedRef.current = studiedBySubject;
  const examRef = useRef(examDates); examRef.current = examDates;

  useEffect(() => { clearLegacy(); }, []);

  // загрузка/очистка при смене аккаунта (+ подтягиваем прогресс с сервера)
  useEffect(() => {
    if (authLoading) return;
    const prev = prevUidRef.current;
    if (prev === uid) return;
    if (prev !== null || uid !== "anon") clearAnon();
    const data = loadFor(uid);
    setResultsBySubjectState(data.results);
    setStudiedBySubjectState(data.studied);
    setExamDatesState(data.examDates);
    setLastSubjectKeyState(data.lastSubject);
    prevUidRef.current = uid;

    if (isServerUser(uid)) {
      fetch("/api/progress", { headers: authHeaders() })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          const p = d?.progress; if (!p) return;
          if (Object.keys(p.results || {}).length || Object.keys(p.studied || {}).length) {
            setResultsBySubjectState(p.results || {}); persist("vs_results", p.results || {});
            setStudiedBySubjectState(p.studied || {}); persist("vs_studied", p.studied || {});
            setExamDatesState(p.examDates || {}); persist("vs_examDates", p.examDates || {});
          }
        }).catch(() => {});
    }
  }, [uid, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (base, val) => { const s = storageFor(uidRef.current); if (!s) return; try { s.setItem(nsKey(base, uidRef.current), JSON.stringify(val)); } catch { /* ignore */ } };
  function pushProgress(res, stu, exd) {
    if (!isServerUser(uidRef.current)) return; // сервер только для реальных аккаунтов
    fetch("/api/progress", { method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ results: res, studied: stu, examDates: exd }) }).catch(() => {});
  }

  const setResults = (r) => {
    const n = { ...resultsRef.current, [r.subjectKey]: r };
    setResultsBySubjectState(n); persist("vs_results", n);
    setLastSubjectKeyState(r.subjectKey); persist("vs_lastSubject", r.subjectKey);
    pushProgress(n, studiedRef.current, examRef.current);
  };
  const results = lastSubjectKey ? resultsBySubject[lastSubjectKey] : null;

  const studiedFor = (subjectKey) => studiedBySubject[subjectKey] || [];
  const markStudied = (subjectKey, topic) => {
    const arr = studiedRef.current[subjectKey] || [];
    if (arr.includes(topic)) return;
    const n = { ...studiedRef.current, [subjectKey]: [...arr, topic] };
    setStudiedBySubjectState(n); persist("vs_studied", n);
    pushProgress(resultsRef.current, n, examRef.current);
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

  const examDateFor = (subjectKey) => examDates[subjectKey] || null;
  const setExamDate = (subjectKey, d) => {
    const n = { ...examRef.current, [subjectKey]: d };
    setExamDatesState(n); persist("vs_examDates", n);
    pushProgress(resultsRef.current, studiedRef.current, n);
  };

  const [notifyEnabled, setNotifyState] = useState(() => { try { return JSON.parse(localStorage.getItem("vs_notify") || "false"); } catch { return false; } });
  const setNotifyEnabled = (v) => { setNotifyState(v); try { localStorage.setItem("vs_notify", JSON.stringify(v)); } catch { /* ignore */ } };

  // недельный лимит запросов к ИИ (free — 10/неделю)
  const [usage, setUsage] = useState(() => {
    try { const u = JSON.parse(localStorage.getItem("vs_usage") || "null"); if (u && u.week === weekKey()) return u; } catch { /* ignore */ }
    return { week: weekKey(), count: 0 };
  });
  const usedToday = usage.week === weekKey() ? usage.count : 0; // на этой неделе
  function useOneMessage() {
    setUsage((prev) => {
      const wk = weekKey();
      const base = prev.week === wk ? prev : { week: wk, count: 0 };
      const next = { week: wk, count: base.count + 1 };
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