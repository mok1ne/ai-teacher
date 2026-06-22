import { useNavigate, Navigate } from "react-router-dom";
import { Flame, Award, CheckCircle2, Users, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Gauge from "../components/ui/Gauge";
import { Stat } from "../components/Pieces";
import { ExamBlock } from "../components/ExamReminder";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

export default function Progress() {
  const navigate = useNavigate();
  const { results, studied, boostedScore, setTutorTarget } = useApp();
  if (!results) return <Navigate to="/test" replace />;

  const subject = SUBJECTS[results.subjectKey];
  const score = boostedScore;
  const remaining = results.weak.filter((t) => !studied.includes(t));
  const openTutor = (t) => { setTutorTarget({ topic: t, exam: subject.level }); navigate("/chat"); };

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 20px 60px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 18px" }}>Мой прогресс</h1>

      <ExamBlock />

      <div className="cards-2" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 18 }}>
        <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.soft, textTransform: "uppercase" }}>Текущий прогноз</div>
          <Gauge value={score} />
          {score > results.predicted && (
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.greenDk }}>
              +{score - results.predicted} с момента старта ({results.predicted})
            </div>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
          <Stat Icon={Flame} c={C.amber} bg={C.creamBg} value={`${studied.length} ${studied.length === 1 ? "день" : "дн."}`} label="Серия занятий" />
          <Stat Icon={Award} c={C.green} bg={C.mintBg} value={`${studied.length} из ${results.weak.length}`} label="Тем разобрано" />
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 22 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700 }}>Темы для подготовки</h3>
        <div style={{ display: "grid", gap: 9 }}>
          {results.weak.map((t) => {
            const done = studied.includes(t);
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "12px 14px", borderRadius: 12, background: done ? C.mintBg : "#F8FAFC", border: `1px solid ${done ? "#BBF7D0" : C.line}` }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, fontWeight: 600, color: done ? C.greenDk : C.ink }}>
                  {done ? <CheckCircle2 size={18} style={{ color: C.green }} /> : <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.soft}` }} />}
                  {t}
                </span>
                {!done && <Button size="sm" color={C.purple} onClick={() => openTutor(t)}>Разобрать</Button>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 18, borderRadius: 20, padding: 24, background: `linear-gradient(120deg,${C.blue},${C.purple})`, color: "#fff",
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Users size={30} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Покажите прогресс родителю</h3>
          <p style={{ margin: 0, fontSize: 14, opacity: .92 }}>{remaining.length > 0 ? "Откройте все предметы и проверку сочинений — оформит родитель в один тап." : "Все темы разобраны! Откройте новые предметы вместе с родителем."}</p>
        </div>
        <Button color="#fff" style={{ color: C.blue }} onClick={() => navigate("/parent")}>Поделиться <ArrowRight size={16} /></Button>
      </div>
    </main>
  );
}
