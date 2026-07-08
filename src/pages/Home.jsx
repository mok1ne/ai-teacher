import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Target,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Brain,
  BarChart3,
  Lock,
  Trophy,
} from "lucide-react";
import Button from "../components/ui/Button";
import HeroArt from "../components/HeroArt";
import { Pill, SectionHead } from "../components/Pieces";
import { subjectsForLevel } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";
import "./Home.scss";

export default function Home() {
  const navigate = useNavigate();
  const { setTutorTarget } = useApp();
  const { level } = useAuth();
  const openChat = () => {
    setTutorTarget(null);
    navigate("/chat");
  };

  const steps = [
    {
      Icon: BarChart3,
      c: C.blue,
      bg: C.blueBg,
      t: "Диагностика",
      d: "Короткий тест определяет ваш уровень и точный прогноз балла.",
    },
    {
      Icon: Brain,
      c: C.purple,
      bg: C.lavBg,
      t: "Разбор с ИИ",
      d: "Персональный репетитор объясняет именно ваши слабые темы — понятно и по шагам.",
    },
    {
      Icon: TrendingUp,
      c: C.green,
      bg: C.mintBg,
      t: "Рост балла",
      d: "Прогресс виден после каждого занятия. Вы движетесь к цели, а не учите всё подряд.",
    },
  ];

  return (
    <main className="home">
      {/* hero */}
      <section className="page home__hero">
        <div className="home__hero-grid">
          <div>
            <h1 className="home__title">
              Подготовка к <span className="home__hl-blue">ОГЭ</span> и{" "}
              <span className="home__hl-purple">ЕГЭ</span>
            </h1>
            <p className="home__sub">
              Не просто чат с ИИ — наставник, который видит твои пробелы и ведёт
              от первой ошибки до высокого балла.
            </p>
            <div className="home__pills">
              <Pill
                Icon={BookOpen}
                title={"Понятные\nобъяснения"}
                color={C.blue}
                bg={C.blueBg}
              />
              <Pill
                Icon={Target}
                title={"Эффективная\nподготовка"}
                color={C.purple}
                bg={C.lavBg}
              />
              <Pill
                Icon={TrendingUp}
                title={"Высокие\nрезультаты"}
                color={C.green}
                bg={C.mintBg}
              />
            </div>
            <div className="home__btns">
              <Button size="lg" onClick={() => navigate("/test")}>
                Начать подготовку <ArrowRight size={18} />
              </Button>
              <Button
                size="lg"
                variant="soft"
                color="var(--btn-soft)"
                onClick={openChat}
              >
                <MessageCircle size={17} /> Открыть чат с репетитором
              </Button>
            </div>
            <p className="home__free">
              <ShieldCheck size={15} /> Бесплатно по регистрации — 10 запросов к
              ИИ в неделю
            </p>
          </div>
          <HeroArt />
        </div>
      </section>

      {/* how it works */}
      <section className="page home__how">
        <SectionHead
          eyebrow="Как это работает"
          title="Три шага до уверенности на экзамене"
        />
        <div className="home__cards3">
          {steps.map((s, i) => (
            <div key={i} className="home__step">
              <div className="home__step-icon" style={{ "--ic-bg": s.bg }}>
                <s.Icon size={23} style={{ color: s.c }} />
              </div>
              <h3 className="home__step-title">{s.t}</h3>
              <p className="home__step-text">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* trust banner */}
      <section className="page home__trust-wrap">
        <div className="home__trust">
          <div className="home__trust-icon">
            <ShieldCheck size={28} />
          </div>
          <div className="home__trust-main">
            <h3 className="home__trust-title">
              Никаких выдумок — только проверенные источники
            </h3>
            <p className="home__trust-text">
              ИИ отвечает строго по кодификаторам и заданиям ФИПИ. Если он
              чего-то не знает — честно скажет об этом, а не сочинит. Ваши баллы
              важнее красивого ответа.
            </p>
          </div>
          <Button color={C.green} onClick={openChat} style={{ flexShrink: 0 }}>
            <MessageCircle size={17} /> Спросить репетитора
          </Button>
        </div>
      </section>

      {/* subjects */}
      <section className="page home__subjects">
        <SectionHead
          eyebrow="Предметы"
          title="Учись эффективно. Сдавай уверенно."
        />
        <div className="home__cards3">
          {subjectsForLevel(level || "ege").map(([key, s]) => (
            <div
              key={key}
              onClick={() => s.available && navigate(`/test/${key}`)}
              className={`home__subject${s.available ? "" : " home__subject--locked"}`}
              style={{
                "--sub-bg": s.bg,
                "--sub-acc": s.accent,
                "--sub-shadow": s.accent + "88",
              }}
            >
              <div className="home__subject-icon">
                <s.Icon size={24} style={{ color: s.accent }} />
              </div>
              <div className="home__subject-main">
                <div className="home__subject-name">{s.name}</div>
                <div className="home__subject-level">{s.level}</div>
              </div>
              {s.available ? (
                <ArrowRight size={18} className="home__subject-arrow" />
              ) : (
                <span className="home__subject-soon">
                  <Lock size={12} /> Скоро
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="home__subjects-note">
          На старте MVP доступны Математика и Русский язык — остальные предметы
          в разработке.
        </p>
      </section>

      {/* result CTA band */}
      <section className="page home__cta-wrap">
        <div className="home__cta">
          <Trophy size={36} style={{ marginBottom: 10 }} />
          <h2 className="home__cta-title big-h2">Твой результат — наша цель</h2>
          <p className="home__cta-text">
            Индивидуальный подход, проверенные методики, отличные результаты.
            Узнайте свой стартовый балл прямо сейчас.
          </p>
          <Button
            size="lg"
            color="#fff"
            onClick={() => navigate("/test")}
            style={{ color: C.blue }}
          >
            Начать бесплатно <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </main>
  );
}
