import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, ShieldCheck, CheckCircle2, Loader2, Send, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import ChatBubble from "../components/ChatBubble";
import { callClaude } from "../lib/api";
import { getSource } from "../data/knowledgeBase";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { PLAN_LIMITS } from "../config";
import { C } from "../theme";
import "./Tutor.scss";

export default function Tutor() {
  const navigate = useNavigate();
  const { tutorTarget, studiedFor, markStudied, studentSummaryFor, usedToday, useOneMessage } = useApp();
  const { user, loading } = useAuth();

  const plan = user?.plan || "anon";
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.anon;
  const [serverBlocked, setServerBlocked] = useState(false);
  const remaining = Math.max(0, limit - usedToday);
  const canSend = remaining > 0 && !serverBlocked;
  const limitReached = !canSend;
  const unlimited = limit >= 100000;

  const general = !tutorTarget;
  const topic = tutorTarget?.topic || "Подготовка к ЕГЭ и ОГЭ";
  const examName = tutorTarget?.exam || "ЕГЭ/ОГЭ";
  const subjectKey = tutorTarget?.subjectKey || null;
  const source = general ? null : getSource(topic);
  const studentSummary = subjectKey ? studentSummaryFor(subjectKey) : null;
  const isStudied = subjectKey ? studiedFor(subjectKey).includes(topic) : false;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const scroller = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (loading) return;
    if (!user) return;
    started.current = true;
    if (limitReached) return;
    const seed = { role: "user", hidden: true,
      content: general
        ? `Поприветствуй ученика как ИИ-репетитор сервиса «Время сдавать». Коротко и тепло скажи, что помогаешь готовиться к ЕГЭ и ОГЭ по любому предмету и теме, и спроси, с чего хочет начать.`
        : `Это твоя первая реплика по теме. Сначала коротко и тепло поддержи ученика: опираясь на контекст о нём, отметь, что у него уже получается, и спокойно скажи, что эту тему мы сейчас разберём вместе — без осуждения. Затем понятно объясни тему «${topic}» для подготовки к ${examName} с коротким примером и закончи одним тренировочным вопросом.` };
    run([seed]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  async function run(msgs) {
    setBusy(true); setError(false);
    try {
      const reply = await callClaude(msgs.filter((m) => m.content), topic, examName, source, studentSummary);
      setMessages([...msgs, { role: "assistant", content: reply }]);
      useOneMessage(); // списываем запрос ТОЛЬКО при успешном ответе
    } catch (e) {
      if (e && e.code === "rate_limited") { setServerBlocked(true); setMessages(msgs); }
      else { setError(true); setMessages(msgs); }
    } finally { setBusy(false); }
  }
  function send() {
    const text = input.trim();
    if (!text || busy || !canSend) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); run(next);
  }
  const visible = messages.filter((m) => !m.hidden);

  if (loading) {
    return (
      <main className="page tutor-loading">
        <Loader2 size={28} className="spin tutor-loading__icon" />
      </main>
    );
  }
  if (!user) {
    return (
      <main className="page tutor-gate">
        <div className="tutor-gate__icon"><Brain size={28} /></div>
        <h1 className="tutor-gate__title">Чат доступен после входа</h1>
        <p className="tutor-gate__text">Войдите через VK или почту, чтобы заниматься с ИИ-репетитором и сохранять прогресс.</p>
        <Button size="lg" onClick={() => navigate("/login?next=/chat")}>Войти и продолжить</Button>
      </main>
    );
  }

  return (
    <main className="tutor">
      <div className="tutor__top">
        <button onClick={() => navigate(-1)} className="tutor__back"><ArrowLeft size={16} /> Назад</button>
        <div className="tutor__badge">{general ? "Чат с репетитором" : `Тема: ${topic}`}</div>
      </div>

      <div className="tutor__cols">
        <div className="tutor__main">
          <div ref={scroller} className="tutor__scroll">
            <div className="tutor__intro">
              <div className="tutor__intro-icon"><Brain size={22} /></div>
              <div className="tutor__intro-text">Ваш персональный ИИ-репетитор. Отвечает по формату ФИПИ, без выдумок, и только по учёбе.</div>
            </div>

            {visible.map((m, i) => <ChatBubble key={i} role={m.role} text={m.content} />)}
            {busy && <ChatBubble role="assistant" typing />}
            {error && (
              <div className="tutor__error">
                Не удалось связаться с ИИ. Проверьте соединение и попробуйте отправить сообщение ещё раз.
              </div>
            )}
            {limitReached && visible.length === 0 && !busy && (
              <div className="tutor__limit-msg">
                На этой неделе бесплатные сообщения закончились. Лимит обновится на следующей неделе — или откройте безлимит.
              </div>
            )}
          </div>

          {!general && !isStudied && visible.length > 0 && !busy && (
            <div className="tutor__studied-btn">
              <Button size="sm" variant="soft" color={C.green} onClick={() => markStudied(subjectKey, topic)}>
                <CheckCircle2 size={15} /> Я разобрался — отметить тему изученной (+2 балла к прогнозу)
              </Button>
            </div>
          )}
          {!general && isStudied && (
            <div className="tutor__studied-done">
              ✓ Тема изучена. <span onClick={() => navigate("/progress")} className="tutor__link">Посмотреть прогресс</span>
            </div>
          )}

          {limitReached ? (
            <div className="tutor__lock">
              <Lock size={20} className="tutor__lock-icon" />
              {!user ? (
                <>
                  <div className="tutor__lock-text">Бесплатные сообщения без входа закончились. Войдите через VK или почту, чтобы продолжить.</div>
                  <Button size="sm" color={C.purple} onClick={() => navigate("/login?next=/chat")}>Войти</Button>
                </>
              ) : (
                <>
                  <div className="tutor__lock-text">Недельный лимит тарифа исчерпан ({limit} сообщений). Откройте безлимит, чтобы продолжить.</div>
                  <Button size="sm" color={C.purple} onClick={() => navigate("/parent")}>Открыть безлимит</Button>
                </>
              )}
            </div>
          ) : (
            <>
              {!unlimited && (
                <div className="tutor__remaining">
                  Осталось {remaining} из {limit} сообщений на этой неделе{!user ? " · войдите, чтобы получить больше" : ""}
                </div>
              )}
              <div className="tutor__inputbar">
                <textarea value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={general ? "Спросите что угодно по подготовке…" : "Задайте вопрос по теме…"} rows={1}
                  className="tutor__textarea" />
                <Button onClick={send} disabled={busy || !input.trim()} style={{ padding: 13, borderRadius: 14 }}>
                  {busy ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                </Button>
              </div>
            </>
          )}
        </div>

        <aside className="tutor__panel">
          <div className="tutor__panel-head">
            <div className="tutor__panel-icon"><ShieldCheck size={17} /></div>
            <div className="tutor__panel-title">Проверенный источник</div>
          </div>
          {source ? (
            <>
              <div className="tutor__panel-ref">{source.ref}</div>
              <p className="tutor__panel-text">{source.content}</p>
              <div className="tutor__panel-note">
                ИИ отвечает строго по этому источнику. За его пределами — честно скажет, что в проверенной базе данных нет.
              </div>
            </>
          ) : (
            <p className="tutor__panel-text">
              Когда вы разбираете конкретную тему из диагностики, ИИ опирается на кодификаторы и задания ФИПИ — и источник появляется здесь.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}