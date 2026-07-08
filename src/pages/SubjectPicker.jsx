import { useNavigate } from "react-router-dom";
import { subjectsForLevel } from "../data/subjects";
import { useAuth } from "../context/AuthContext";
import "./SubjectPicker.scss";

export default function SubjectPicker() {
  const navigate = useNavigate();
  const { level } = useAuth();
  const items = subjectsForLevel(level || "ege");
  const levelName = (level || "ege") === "oge" ? "ОГЭ" : "ЕГЭ";

  return (
    <main className="page picker">
      <h1 className="picker__title">Выберите предмет для диагностики</h1>
      <p className="picker__desc">
        Подготовка к {levelName}. Короткий тест покажет ваш прогноз балла и слабые темы. Уровень можно изменить в настройках.
      </p>

      <div className="picker__grid">
        {items.map(([key, s]) => (
          <div key={key} onClick={() => s.available && navigate(`/test/${key}`)}
            className={`subject-card${s.available ? "" : " subject-card--locked"}`}
            style={{ "--sp-bg": s.bg, "--sp-border": s.available ? s.accent + "33" : "var(--line)" }}>
            <div className="subject-card__icon"><s.Icon size={22} style={{ color: s.accent }} /></div>
            <div className="subject-card__body">
              <div className="subject-card__name">{s.name}</div>
              <div className="subject-card__meta">{s.available ? `${s.questions.length} вопросов · ${s.level}` : "Скоро"}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}