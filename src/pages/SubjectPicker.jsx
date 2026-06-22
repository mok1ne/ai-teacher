import { useNavigate } from "react-router-dom";
import { SUBJECTS } from "../data/subjects";
import { C } from "../theme";

export default function SubjectPicker() {
  const navigate = useNavigate();
  return (
    <main className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "44px 20px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Выберите предмет для диагностики</h1>
      <p style={{ fontSize: 15.5, color: C.mut, margin: "0 0 26px" }}>Короткий тест покажет ваш прогноз балла и слабые темы. Без регистрации.</p>
      <div className="cards-2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {Object.entries(SUBJECTS).map(([key, s]) => (
          <div key={key} onClick={() => s.available && navigate(`/test/${key}`)}
            style={{ background: "#fff", border: `1.5px solid ${s.available ? s.accent + "33" : C.line}`, borderRadius: 16, padding: 18,
              cursor: s.available ? "pointer" : "default", opacity: s.available ? 1 : 0.55, display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "grid", placeItems: "center" }}>
              <s.Icon size={22} style={{ color: s.accent }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.soft }}>{s.available ? `${s.questions.length} вопросов · ${s.level}` : "Скоро"}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
