import { useNavigate, Navigate } from "react-router-dom";
import { Target, CheckCircle2, Brain, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import Button from "../components/ui/Button";
import Gauge from "../components/ui/Gauge";
import { SUBJECTS } from "../data/subjects";
import { ExamBlock } from "../components/ExamReminder";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

export default function Results() {
  const navigate = useNavigate();
  const { results, setTutorTarget } = useApp();
  if (!results) return <Navigate to="/test" replace />;

  const subject = SUBJECTS[results.subjectKey];
  const { predicted, correct, total, weak, strong } = results;

  const openTutor = (topic) => { setTutorTarget({ topic, exam: subject.level }); navigate("/chat"); };

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 20px 60px" }}>
      <ExamBlock />
      <div className="res-2col" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 24, alignItems: "start" }}>
        {/* score card */}
        <div style={{ textAlign: "center", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: "28px 22px", boxShadow: "0 14px 40px -28px #0f172a66" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.soft, textTransform: "uppercase", letterSpacing: ".05em" }}>Ваш прогноз балла · {subject.name}</div>
          <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}><Gauge value={predicted} /></div>
          <p style={{ fontSize: 14.5, color: C.mut, margin: "0 0 18px" }}>
            Верных ответов: <b style={{ color: C.ink }}>{correct} из {total}</b>. Это ориентировочный стартовый балл — с разбором тем он будет расти.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {weak.length > 0 && <Button color={C.purple} onClick={() => openTutor(weak[0])} style={{ justifyContent: "center" }}><Sparkles size={17} /> Разобрать первую тему</Button>}
            <Button variant="soft" onClick={() => navigate(`/test/${results.subjectKey}`)} style={{ justifyContent: "center" }}><RefreshCw size={16} /> Пройти заново</Button>
          </div>
        </div>

        {/* topics */}
        <div>
          {weak.length > 0 && (
            <div>
              <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                <Target size={20} style={{ color: C.amber }} /> Темы, которые стоит подтянуть
              </h3>
              <p style={{ fontSize: 14, color: C.mut, margin: "0 0 14px" }}>Начните с первой — ИИ-репетитор разберёт её с вами прямо сейчас.</p>
              <div style={{ display: "grid", gap: 10 }}>
                {weak.map((t, i) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    background: "#fff", border: `1.5px solid ${i === 0 ? C.purple + "55" : C.line}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: C.lavBg, color: C.purple, display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Brain size={16} />
                      </span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{t}</span>
                    </div>
                    <Button size="sm" color={C.purple} onClick={() => openTutor(t)}>Разобрать <ArrowRight size={15} /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {strong.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} style={{ color: C.green }} /> Уже хорошо
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {strong.map((t) => (
                  <span key={t} style={{ fontSize: 13, fontWeight: 600, color: C.greenDk, background: C.mintBg, padding: "7px 13px", borderRadius: 20 }}>{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
