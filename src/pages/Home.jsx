import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Target, TrendingUp, ArrowRight, MessageCircle, ShieldCheck,
  Brain, BarChart3, Lock, Trophy,
} from "lucide-react";
import Button from "../components/ui/Button";
import HeroArt from "../components/HeroArt";
import { Pill, SectionHead, LevelTabs } from "../components/Pieces";
import { SUBJECTS, subjectsForLevel } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

export default function Home() {
  const navigate = useNavigate();
  const { setTutorTarget } = useApp();
  const [level, setLevel] = useState("ege");
  const openChat = () => { setTutorTarget(null); navigate("/chat"); };

  return (
    <main>
      {/* hero */}
      <section className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "46px 22px 30px" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 40, alignItems: "center" }}>
          <div>
            <h1 className="hero-title" style={{ fontSize: 46, lineHeight: 1.08, fontWeight: 800, margin: 0, letterSpacing: "-.02em" }}>
              Подготовка к <span style={{ color: C.blue }}>ОГЭ</span> и <span style={{ color: C.purple }}>ЕГЭ</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 21, color: C.sub, marginTop: 14, lineHeight: 1.4, fontWeight: 500 }}>
              Уверенность сегодня — успех завтра!
            </p>
            <div className="pills" style={{ display: "flex", gap: 26, flexWrap: "wrap", margin: "26px 0 30px" }}>
              <Pill Icon={BookOpen} title={"Понятные\nобъяснения"} color={C.blue} bg={C.blueBg} />
              <Pill Icon={Target} title={"Эффективная\nподготовка"} color={C.purple} bg={C.lavBg} />
              <Pill Icon={TrendingUp} title={"Высокие\nрезультаты"} color={C.green} bg={C.mintBg} />
            </div>
            <div className="btn-row" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button size="lg" onClick={() => navigate("/test")}>Начать подготовку <ArrowRight size={18} /></Button>
              <Button size="lg" variant="soft" color={C.purple} onClick={openChat}>
                <MessageCircle size={17} /> Открыть чат с репетитором
              </Button>
            </div>
            <p style={{ fontSize: 13, color: C.soft, marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={15} /> Бесплатно и без регистрации — просто начните тест
            </p>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* how it works */}
      <section className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "30px 22px" }}>
        <SectionHead eyebrow="Как это работает" title="Три шага до уверенности на экзамене" />
        <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[
            { Icon: BarChart3, c: C.blue, bg: C.blueBg, t: "Диагностика", d: "Короткий тест определяет ваш уровень и точный прогноз балла." },
            { Icon: Brain, c: C.purple, bg: C.lavBg, t: "Разбор с ИИ", d: "Персональный репетитор объясняет именно ваши слабые темы — понятно и по шагам." },
            { Icon: TrendingUp, c: C.green, bg: C.mintBg, t: "Рост балла", d: "Прогресс виден после каждого занятия. Вы движетесь к цели, а не учите всё подряд." },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 20, padding: 24, boxShadow: "0 8px 24px -18px #0f172a55" }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: s.bg, display: "grid", placeItems: "center", marginBottom: 14 }}>
                <s.Icon size={23} style={{ color: s.c }} />
              </div>
              <h3 style={{ margin: "0 0 7px", fontSize: 18, fontWeight: 700 }}>{s.t}</h3>
              <p style={{ margin: 0, fontSize: 14.5, color: C.mut, lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* trust banner */}
      <section className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "16px 22px" }}>
        <div style={{ borderRadius: 22, padding: "26px 28px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap",
          background: "linear-gradient(120deg,#ECFDF3,#EFF4FF)", border: `1px solid ${C.line}` }}>
          <div style={{ width: 54, height: 54, borderRadius: 15, background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 6px 16px -10px #0f172a66" }}>
            <ShieldCheck size={28} style={{ color: C.green }} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>Никаких выдумок — только проверенные источники</h3>
            <p style={{ margin: 0, fontSize: 14.5, color: C.sub, lineHeight: 1.5 }}>
              ИИ отвечает строго по кодификаторам и заданиям ФИПИ. Если он чего-то не знает — честно скажет об этом, а не сочинит. Ваши баллы важнее красивого ответа.
            </p>
          </div>
          <Button color={C.green} onClick={openChat} style={{ flexShrink: 0 }}>
            <MessageCircle size={17} /> Спросить репетитора
          </Button>
        </div>
      </section>

      {/* subjects */}
      <section className="page" style={{ maxWidth: 1300, margin: "0 auto", padding: "30px 22px 10px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <SectionHead eyebrow="Предметы" title="Учись эффективно. Сдавай уверенно." />
          <div style={{ marginBottom: 20 }}><LevelTabs value={level} onChange={setLevel} /></div>
        </div>
        <div className="cards-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {subjectsForLevel(level).map(([key, s]) => (
            <div key={key} onClick={() => s.available && navigate(`/test/${key}`)}
              style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 18, padding: 20,
                cursor: s.available ? "pointer" : "default", opacity: s.available ? 1 : 0.62,
                transition: "all .15s", display: "flex", alignItems: "center", gap: 14 }}
              onMouseEnter={(e) => s.available && (e.currentTarget.style.boxShadow = `0 12px 28px -16px ${s.accent}88`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
              <div style={{ width: 50, height: 50, borderRadius: 13, background: s.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <s.Icon size={24} style={{ color: s.accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: C.soft, marginTop: 2 }}>{s.level}</div>
              </div>
              {s.available
                ? <ArrowRight size={18} style={{ color: s.accent }} />
                : <span style={{ fontSize: 11, fontWeight: 700, color: C.soft, display: "flex", alignItems: "center", gap: 4 }}><Lock size={12} /> Скоро</span>}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: C.soft, marginTop: 14 }}>На старте MVP доступны Математика и Русский язык — остальные предметы в разработке.</p>
      </section>

      {/* result CTA band */}
      <section className="page" style={{ maxWidth: 1300, margin: "26px auto 10px", padding: "0 22px" }}>
        <div style={{ borderRadius: 24, padding: "34px 30px", textAlign: "center",
          background: `linear-gradient(120deg,${C.blue},${C.purple})`, color: "#fff" }}>
          <Trophy size={36} style={{ marginBottom: 10 }} />
          <h2 className="big-h2" style={{ margin: "0 0 8px", fontSize: 27, fontWeight: 800 }}>Твой результат — наша цель</h2>
          <p style={{ margin: "0 auto 20px", fontSize: 16, opacity: .92, maxWidth: 520, lineHeight: 1.5 }}>
            Индивидуальный подход, проверенные методики, отличные результаты. Узнайте свой стартовый балл прямо сейчас.
          </p>
          <Button size="lg" color="#fff" onClick={() => navigate("/test")} style={{ color: C.blue }}>
            Начать бесплатно <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </main>
  );
}
