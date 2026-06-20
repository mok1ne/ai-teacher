import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, ShieldCheck, CheckCircle2, Loader2, Send } from "lucide-react";
import Button from "../components/ui/Button";
import ChatBubble from "../components/ChatBubble";
import { callClaude } from "../lib/api";
import { getSource } from "../data/knowledgeBase";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

export default function Tutor() {
  const navigate = useNavigate();
  const { tutorTarget, studied, markStudied } = useApp();

  const general = !tutorTarget;
  const topic = tutorTarget?.topic || "Подготовка к ЕГЭ и ОГЭ";
  const examName = tutorTarget?.exam || "ЕГЭ/ОГЭ";
  const source = general ? null : getSource(topic);
  const isStudied = studied.includes(topic);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const scroller = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const seed = { role: "user", hidden: true,
      content: general
        ? `Поприветствуй ученика как ИИ-репетитор сервиса «Время сдавать». Коротко скажи, что помогаешь готовиться к ЕГЭ и ОГЭ по любому предмету и теме, и спроси, с чего хочет начать. Будь дружелюбным и кратким.`
        : `Объясни тему «${topic}» для подготовки к ${examName}. Дай короткое понятное объяснение с примером и закончи одним тренировочным вопросом.` };
    run([seed]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages, busy]);

  async function run(msgs) {
    setBusy(true); setError(false);
    try {
      const reply = await callClaude(msgs.filter((m) => m.content), topic, examName, source);
      setMessages([...msgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(true); setMessages(msgs);
    } finally { setBusy(false); }
  }
  function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); run(next);
  }
  const visible = messages.filter((m) => !m.hidden);

  return (
    <main className="chat-page" style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 20px 22px", display: "flex", flexDirection: "column", height: "calc(100vh - 62px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.mut, fontSize: 14, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Назад
        </button>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, background: C.lavBg, padding: "5px 12px", borderRadius: 20 }}>
          {general ? "Чат с репетитором" : `Тема: ${topic}`}
        </div>
      </div>

      <div className="chat-2col" style={{ flex: 1, display: "flex", gap: 18, minHeight: 0 }}>
        {/* chat column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div ref={scroller} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, padding: "10px 2px 18px" }}>
            <div style={{ alignSelf: "center", textAlign: "center", maxWidth: 420, padding: "10px 0 6px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center", margin: "0 auto 8px" }}>
                <Brain size={22} color="#fff" />
              </div>
              <div style={{ fontSize: 13.5, color: C.soft }}>Ваш персональный ИИ-репетитор. Отвечает по формату ФИПИ, без выдумок.</div>
            </div>

            {visible.map((m, i) => <ChatBubble key={i} role={m.role} text={m.content} />)}
            {busy && <ChatBubble role="assistant" typing />}
            {error && (
              <div style={{ alignSelf: "flex-start", background: "#FEF2F2", color: "#B91C1C", padding: "12px 16px", borderRadius: 14, fontSize: 14, maxWidth: "85%" }}>
                Не удалось связаться с ИИ. Проверьте соединение и попробуйте отправить сообщение ещё раз.
              </div>
            )}
          </div>

          {!general && !isStudied && visible.length > 0 && !busy && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
              <Button size="sm" variant="soft" color={C.green} onClick={() => markStudied(topic)}>
                <CheckCircle2 size={15} /> Я разобрался — отметить тему изученной (+2 балла к прогнозу)
              </Button>
            </div>
          )}
          {!general && isStudied && (
            <div style={{ textAlign: "center", marginBottom: 10, fontSize: 13, fontWeight: 600, color: C.greenDk }}>
              ✓ Тема изучена. <span onClick={() => navigate("/progress")} style={{ color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Посмотреть прогресс</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={general ? "Спросите что угодно по подготовке…" : "Задайте вопрос по теме…"} rows={1}
              style={{ flex: 1, resize: "none", padding: "13px 16px", borderRadius: 14, border: `1.5px solid ${C.line}`,
                fontSize: 15, fontFamily: "inherit", outline: "none", maxHeight: 120 }} />
            <Button onClick={send} disabled={busy || !input.trim()} style={{ padding: 13, borderRadius: 14 }}>
              {busy ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </Button>
          </div>
        </div>

        {/* source panel (RAG grounding made visible) */}
        <aside className="source-panel" style={{ width: 300, flexShrink: 0, background: "#F8FAFC", border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.mintBg, display: "grid", placeItems: "center" }}>
              <ShieldCheck size={17} style={{ color: C.green }} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Проверенный источник</div>
          </div>
          {source ? (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.purple, background: C.lavBg, padding: "6px 10px", borderRadius: 9, marginBottom: 10 }}>
                {source.ref}
              </div>
              <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.5, margin: 0 }}>{source.content}</p>
              <div style={{ marginTop: 12, fontSize: 12, color: C.soft, lineHeight: 1.45, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
                ИИ отвечает строго по этому источнику. За его пределами — честно скажет, что в проверенной базе данных нет.
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.5, margin: 0 }}>
              Когда вы разбираете конкретную тему из диагностики, ИИ опирается на кодификаторы и задания ФИПИ — и источник появляется здесь.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
