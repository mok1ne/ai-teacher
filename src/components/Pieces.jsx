import { C } from "../theme";
import Gauge from "./ui/Gauge";
import "./Pieces.scss";

export function Pill({ Icon, title, color, bg }) {
  return (
    <div className="pill">
      <div className="pill__icon" style={{ "--ic-bg": bg }}><Icon size={20} style={{ color }} /></div>
      <span className="pill__title">{title}</span>
    </div>
  );
}

export function SectionHead({ eyebrow, title }) {
  return (
    <div className="section-head">
      <div className="section-head__eyebrow">{eyebrow}</div>
      <h2 className="section-head__title big-h2">{title}</h2>
    </div>
  );
}

export function Stat({ Icon, c, bg, value, label }) {
  return (
    <div className="stat">
      <div className="stat__icon" style={{ "--ic-bg": bg }}><Icon size={22} style={{ color: c }} /></div>
      <div><div className="stat__value">{value}</div><div className="stat__label">{label}</div></div>
    </div>
  );
}

export function LevelTabs({ value, onChange }) {
  const tabs = [["ege", "ЕГЭ"], ["oge", "ОГЭ"]];
  return (
    <div className="level-tabs">
      {tabs.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} className={`level-tabs__btn${value === v ? " level-tabs__btn--active" : ""}`}>{label}</button>
      ))}
    </div>
  );
}

export function ScoreView({ sc }) {
  if (!sc) return null;
  if (sc.kind === "oge") {
    const color = sc.mark >= 4 ? C.greenDk : sc.mark === 3 ? C.amberDk : "#DC2626";
    return (
      <div className="score">
        <div className="score__mark" style={{ color }}>{sc.mark}</div>
        <div className="score__mark-label">ожидаемая оценка ОГЭ</div>
        <div className="score__sub">{sc.primary} из {sc.max} первичных баллов</div>
        {!sc.passed && <div className="score__warn">Пока ниже порога — давай подтянем темы.</div>}
      </div>
    );
  }
  return (
    <div className="score">
      <Gauge value={sc.score} />
      <div className="score__sub">тестовый балл ЕГЭ · ≈ {sc.primary} из {sc.max} первичных</div>
    </div>
  );
}