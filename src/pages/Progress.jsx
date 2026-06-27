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
  const { resultsBySubject, studiedFor, boostedScoreFor, setTutorTarget } = useApp();
  const keys = Object.keys(resultsBySubject);
  if (keys.length === 0) return <Navigate to="/test" replace />;

  const openTutor = (topic, subjectKey) => {
    const s = SUBJECTS[subjectKey];
    setTutorTarget({ topic, exam: s.level, subjectKey });
    navigate("/chat");
  };

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 20px 60px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 18px" }}>Мой прогресс</h1>

      <ExamBlock />

      {keys.map((subjectKey) => {
        const r = resultsBySubject[subjectKey];
        const s = SUBJECTS[subjectKey];
        const score = boostedScoreFor(subjectKey);
        const studied = studiedFor(subjectKey);
        const delta = score - r.predicted;

        return (
          <section key={subjectKey} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 22, padding: "22px 24px", marginBottom: 18, boxShadow: "0 10px 30px -24px #0f172a55" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "grid", placeItems: "center" }}>
                <s.Icon size={22} style={{ color: s.accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: C.soft }}>{s.level}</div>
              </div>
              <Button size="sm" variant="soft" color={s.accent} onClick={() => navigate(`/test/${subjectKey}`)}>Пересдать</Button>
            </div>

            <div className="cards-2" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
              {/* score */}
              <div style={{ textAlign: "center" }}>
                <Gauge value={score} />
                {delta > 0
                  ? <div style={{ fontSize: 13.5, fontWeight: 700, color: C.greenDk }}>+{delta} с момента старта ({r.predicted})</div>
                  : <div style={{ fontSize: 13, color: C.soft }}>Стартовый прогноз. Разбирай темы — балл вырастет.</div>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                  <Stat Icon={Award} c={C.green} bg={C.mintBg} value={`${studied.length}/${r.weak.length}`} label="тем разобрано" />
                  <Stat Icon={Flame} c={C.amber} bg={C.creamBg} value={`${r.correct}/${r.total}`} label="верно в тесте" />
                </div>
              </div>

              {/* topics */}
              <div>
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>Темы для подготовки</h3>
                {r.weak.length === 0 ? (
                  <p style={{ fontSize: 14, color: C.greenDk, margin: 0 }}>Слабых тем нет — отличный результат! 🎉</p>
                ) : (
                  <div style={{ display: "grid", gap: 9 }}>
                    {r.weak.map((t) => {
                      const done = studied.includes(t);
                      return (
                        <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                          padding: "12px 14px", borderRadius: 12, background: done ? C.mintBg : "#F8FAFC", border: `1px solid ${done ? "#BBF7D0" : C.line}` }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, fontWeight: 600, color: done ? C.greenDk : C.ink }}>
                            {done ? <CheckCircle2 size={18} style={{ color: C.green }} /> : <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.soft}` }} />}
                            {t}
                          </span>
                          {!done && <Button size="sm" color={C.purple} onClick={() => openTutor(t, subjectKey)}>Разобрать</Button>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* parent handoff */}
      <div style={{ marginTop: 8, borderRadius: 20, padding: 24, background: `linear-gradient(120deg,${C.blue},${C.purple})`, color: "#fff",
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Users size={30} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Покажите прогресс родителю</h3>
          <p style={{ margin: 0, fontSize: 14, opacity: .92 }}>Откройте все предметы и проверку сочинений — оформит родитель в один тап.</p>
        </div>
        <Button color="#fff" style={{ color: C.blue }} onClick={() => navigate("/parent")}>Поделиться <ArrowRight size={16} /></Button>
      </div>
    </main>
  );
}
