import { useState, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import "./Test.scss";

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

  // Перемешиваем варианты для каждого вопроса один раз (на старте теста).
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
        primary += qq.points || 1;
      }
    });
    let correct = 0; const weak = []; const strong = [];
    Object.entries(stats).forEach(([topic, s]) => {
      correct += s.c;
      if (s.c < s.t) weak.push(topic); else strong.push(topic);
    });
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
    <main className="page test">
      <div className="test__card" style={{ "--acc": subject.accent, "--acc-bg": subject.bg }}>
        <div className="test__top">
          <button onClick={back} className="test__back"><ArrowLeft size={16} /> Назад</button>
          <span className="test__subject">{subject.name} · {subject.level}</span>
          <span className="test__count">{qIndex + 1} / {total}</span>
        </div>
        <div className="test__progress">
          <div className="test__progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="test__topic">{q.topic}</div>
        <h2 className="test__question">{q.text}</h2>

        <div className="test__options">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)} className="test__option">
              <span className="test__letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
        <p className="test__hint"><Clock size={14} /> Отвечайте честно — это нужно, чтобы точно определить ваши пробелы.</p>
      </div>
    </main>
  );
}