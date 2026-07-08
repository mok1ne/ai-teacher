import { useNavigate, Navigate } from "react-router-dom";
import { Target, CheckCircle2, Brain, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import Button from "../components/ui/Button";
import { ScoreView } from "../components/Pieces";
import { SUBJECTS } from "../data/subjects";
import { ExamBlock } from "../components/ExamReminder";
import { useApp } from "../context/AppContext";
import { C } from "../theme";
import "./Results.scss";

export default function Results() {
  const navigate = useNavigate();
  const { results, setTutorTarget, scoreFor } = useApp();
  if (!results) return <Navigate to="/test" replace />;

  const subject = SUBJECTS[results.subjectKey];
  const { correct, total, weak, strong } = results;
  const sc = scoreFor(results.subjectKey);

  const openTutor = (topic) => { setTutorTarget({ topic, exam: subject.level, subjectKey: results.subjectKey }); navigate("/chat"); };

  return (
    <main className="page results">
      <ExamBlock subjectKey={results.subjectKey} />
      <div className="results__grid">
        <div className="results__score">
          <div className="results__score-label">Прогноз · {subject.name} · {subject.level}</div>
          <ScoreView sc={sc} />
          <p className="results__score-note">
            Верных ответов: <b>{correct} из {total}</b>. Ориентировочный результат по шкале {subject.level} — с разбором тем он будет расти.
          </p>
          <div className="results__score-actions">
            {weak.length > 0 && <Button color={C.purple} onClick={() => openTutor(weak[0])} style={{ justifyContent: "center" }}><Sparkles size={17} /> Разобрать первую тему</Button>}
            <Button variant="soft" onClick={() => navigate(`/test/${results.subjectKey}`)} style={{ justifyContent: "center" }}><RefreshCw size={16} /> Пройти заново</Button>
          </div>
        </div>

        <div>
          {weak.length > 0 && (
            <div>
              <h3 className="results__section-title"><Target size={20} style={{ color: C.amber }} /> Темы, которые стоит подтянуть</h3>
              <p className="results__section-desc">Начните с первой — ИИ-репетитор разберёт её с вами прямо сейчас.</p>
              <div className="results__weak">
                {weak.map((t, i) => (
                  <div key={t} className={`results__topic${i === 0 ? " results__topic--first" : ""}`}>
                    <div className="results__topic-left">
                      <span className="results__topic-icon"><Brain size={16} /></span>
                      <span className="results__topic-name">{t}</span>
                    </div>
                    <Button size="sm" color={C.purple} onClick={() => openTutor(t)}>Разобрать <ArrowRight size={15} /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strong.length > 0 && (
            <div className="results__strong">
              <h3 className="results__section-title results__section-title--sm"><CheckCircle2 size={18} style={{ color: C.green }} /> Уже хорошо</h3>
              <div className="results__chips">
                {strong.map((t) => <span key={t} className="results__chip">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}