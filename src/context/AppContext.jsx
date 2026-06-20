import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [results, setResults] = useState(null);      // { subjectKey, predicted, correct, total, weak, strong }
  const [studied, setStudied] = useState([]);        // изученные темы
  const [tutorTarget, setTutorTarget] = useState(null); // { topic, exam } | null (null = общий чат)

  const markStudied = (t) => setStudied((s) => (s.includes(t) ? s : [...s, t]));
  const boostedScore = results ? Math.min(98, results.predicted + studied.length * 2) : 0;

  const value = { results, setResults, studied, markStudied, tutorTarget, setTutorTarget, boostedScore };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
