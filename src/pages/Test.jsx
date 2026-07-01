import { useState, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Test() {
  const { subjectKey } = useParams();
  const navigate = useNavigate();
  const { setResults } = useApp();
  const subject = SUBJECTS[subjectKey];

  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Перемешиваем варианты для каждого вопроса один раз (на старте теста),
  // чтобы правильный ответ не оказывался всегда на одной позиции.
  const questions = useMemo(() => {
    if (!subject) return [];
    return subject.questions.map((q) => {
      const order = shuffle(q.options.map((_, i) => i));
      return { ...q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) };
    });
  }, [subjectKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!subject || !subject.available) return <Navigate to="/test" replace />;

  const q = questions[qIndex];
  const total = questions.length;
  const pct = Math.round((qIndex / total) * 100);

  function finish(allAnswers) {
    const stats = {};
    let primary = 0;
    questions.forEach((qq, idx) => {
      if (!stats[qq.topic]) stats[qq.topic] = { c: 0, t: 0 };
      stats[qq.topic].t++;
      if (allAnswers[idx] === qq.correct) {
        stats[qq.topic].c++;
        primary += qq.points || 1; // сложные задания дают больше первичных баллов
      }
    });
    let correct = 0; const weak = []; const strong = [];
    Object.entries(stats).forEach(([topic, s]) => {
      correct += s.c;
      if (s.c < s.t) weak.push(topic); else strong.push(topic);
    });
    // первичный балл = сумма весов; перевод в шкалу — в lib/scoring.js
    setResults({ subjectKey, levelKey: subject.levelKey, primary, correct, total, weak, strong });
    navigate("/results");
  }

  function answer(i) {
    const next = [...answers, i];
    setAnswers(next);
    if (qIndex + 1 < total) setQIndex(qIndex + 1);
    else finish(next);
  }
  const back = () => (qIndex > 0 ? setQIndex(qIndex - 1) : navigate("/test"));

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "30px 20px 60px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: "26px 26px 28px", boxShadow: "0 14px 40px -28px #0f172a55" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={back} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mut, fontSize: 14, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Назад
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: subject.accent }}>{subject.name} · {subject.level}</span>
          <span style={{ fontSize: 13.5, color: C.soft, fontWeight: 600 }}>{qIndex + 1} / {total}</span>
        </div>
        <div style={{ height: 8, background: C.line, borderRadius: 20, overflow: "hidden", marginBottom: 26 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: subject.accent, borderRadius: 20, transition: "width .3s" }} />
        </div>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.soft, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>{q.topic}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.35, margin: "0 0 24px" }}>{q.text}</h2>

        <div className="qopts" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)}
              style={{ textAlign: "left", padding: "15px 16px", borderRadius: 14, border: `1.5px solid ${C.line}`,
                background: "#fff", cursor: "pointer", fontSize: 15.5, fontWeight: 500, color: C.ink, transition: "all .12s",
                display: "flex", alignItems: "center", gap: 11 }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = subject.accent; e.currentTarget.style.background = subject.bg; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = "#fff"; }}>
              <span style={{ width: 26, height: 26, borderRadius: 8, background: subject.bg, color: subject.accent, fontWeight: 700, fontSize: 13, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.soft, marginTop: 22, display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={14} /> Отвечайте честно — это нужно, чтобы точно определить ваши пробелы.
        </p>
      </div>
    </main>
  );
}
