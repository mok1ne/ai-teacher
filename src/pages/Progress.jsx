import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Award, CheckCircle2, Users, ChevronDown, ChevronUp, LogOut, Mail, ClipboardList, Settings } from "lucide-react";
import Button from "../components/ui/Button";
import { Stat, ScoreView } from "../components/Pieces";
import { ExamBlock } from "../components/ExamReminder";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function Progress() {
  const navigate = useNavigate();
  const { resultsBySubject, lastSubjectKey, studiedFor, scoreFor, setTutorTarget } = useApp();
  const { user, logout } = useAuth();
  const keys = Object.keys(resultsBySubject).filter((k) => SUBJECTS[k]);
  const [open, setOpen] = useState(lastSubjectKey && resultsBySubject[lastSubjectKey] ? lastSubjectKey : (keys[0] || null));

  const openTutor = (topic, subjectKey) => {
    const s = SUBJECTS[subjectKey];
    setTutorTarget({ topic, exam: s.level, subjectKey });
    navigate("/chat");
  };

  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 20px 60px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 14px" }}>Мой прогресс</h1>

      {/* профиль / вход */}
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 18px", marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.lavBg, color: C.purple, display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: 17 }}>
            {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{user.name || "Аккаунт"}</div>
            {user.email && <div style={{ fontSize: 13, color: C.mut, display: "flex", alignItems: "center", gap: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><Mail size={13} /> {user.email}</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Button size="sm" variant="soft" color={C.purple} onClick={() => navigate("/settings")}><Settings size={15} /> Настройки</Button>
            <Button size="sm" variant="soft" color={C.mut} onClick={logout}><LogOut size={15} /> Выйти</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: C.lavBg, border: `1px solid ${C.line}`, borderRadius: 16, padding: "14px 18px", marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, fontSize: 14, color: C.sub }}>Войдите, чтобы сохранять прогресс между устройствами и заниматься с ИИ.</div>
          <Button size="sm" color={C.purple} onClick={() => navigate("/login?next=/progress")}>Войти</Button>
        </div>
      )}

      {keys.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.blueBg, display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
            <ClipboardList size={26} style={{ color: C.blue }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Вы ещё не проходили диагностику</h3>
          <p style={{ fontSize: 14.5, color: C.mut, margin: "0 0 18px" }}>Пройдите короткий тест — и здесь появятся ваш прогноз балла и темы для подготовки.</p>
          <Button onClick={() => navigate("/test")}>Пройти тест</Button>
        </div>
      ) : (
      <>
      <p style={{ fontSize: 14.5, color: C.mut, margin: "0 0 22px" }}>Нажмите на предмет, чтобы открыть подготовку и настроить дату экзамена.</p>

      <div style={{ display: "grid", gap: 12 }}>
        {keys.map((subjectKey) => {
          const r = resultsBySubject[subjectKey];
          const s = SUBJECTS[subjectKey];
          const sc = scoreFor(subjectKey);
          const studied = studiedFor(subjectKey);
          const expanded = open === subjectKey;
          const headNum = sc.kind === "oge" ? sc.mark : sc.score;
          const headLabel = sc.kind === "oge" ? "оценка" : "балл ЕГЭ";

          return (
            <div key={subjectKey} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", boxShadow: expanded ? "0 12px 32px -22px #0f172a66" : "none" }}>
              {/* header row */}
              <button onClick={() => setOpen(expanded ? null : subjectKey)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <s.Icon size={22} style={{ color: s.accent }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: C.soft }}>{studied.length} из {r.weak.length} тем разобрано · {s.level}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{headNum}</div>
                  <div style={{ fontSize: 11, color: C.soft }}>{headLabel}</div>
                </div>
                {expanded ? <ChevronUp size={20} style={{ color: C.soft, flexShrink: 0 }} /> : <ChevronDown size={20} style={{ color: C.soft, flexShrink: 0 }} />}
              </button>

              {/* expanded body */}
              {expanded && (
                <div style={{ padding: "4px 20px 22px", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ marginTop: 16 }}>
                    <ExamBlock subjectKey={subjectKey} />
                  </div>

                  <div className="cards-2" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
                    <div style={{ textAlign: "center" }}>
                      <ScoreView sc={sc} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                        <Stat Icon={Award} c={C.green} bg={C.mintBg} value={`${studied.length}/${r.weak.length}`} label="тем разобрано" />
                        <Stat Icon={Flame} c={C.amber} bg={C.creamBg} value={`${r.correct}/${r.total}`} label="верно в тесте" />
                      </div>
                      <Button size="sm" variant="soft" color={s.accent} onClick={() => navigate(`/test/${subjectKey}`)} style={{ marginTop: 12 }}>Пересдать тест</Button>
                    </div>

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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* parent handoff */}
      <div style={{ marginTop: 20, borderRadius: 20, padding: 24, background: `linear-gradient(120deg,${C.blue},${C.purple})`, color: "#fff",
        display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Users size={30} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Покажите прогресс родителю</h3>
          <p style={{ margin: 0, fontSize: 14, opacity: .92 }}>Откройте все предметы и проверку сочинений — оформит родитель в один тап.</p>
        </div>
        <Button color="#fff" style={{ color: C.blue }} onClick={() => navigate("/parent")}>Поделиться</Button>
      </div>
      </>
      )}
    </main>
  );
}
