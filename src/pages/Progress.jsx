import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Award, CheckCircle2, ChevronDown, ChevronUp, LogOut, Mail, ClipboardList, Settings, Share2, Send, MessageCircle, Copy } from "lucide-react";
import Button from "../components/ui/Button";
import { Stat, ScoreView } from "../components/Pieces";
import { ExamBlock } from "../components/ExamReminder";
import { SUBJECTS } from "../data/subjects";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";
import "./Progress.scss";

export default function Progress() {
  const navigate = useNavigate();
  const { resultsBySubject, lastSubjectKey, studiedFor, scoreFor, setTutorTarget } = useApp();
  const { user, logout } = useAuth();
  const keys = Object.keys(resultsBySubject).filter((k) => SUBJECTS[k]);
  const [open, setOpen] = useState(lastSubjectKey && resultsBySubject[lastSubjectKey] ? lastSubjectKey : (keys[0] || null));
  const [shared, setShared] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareLines = keys.map((k) => {
    const s = SUBJECTS[k]; const sc = scoreFor(k);
    if (!s || !sc) return null;
    return sc.kind === "oge" ? `— ${s.name} (${s.level}): ожидаемая оценка ${sc.mark}` : `— ${s.name} (${s.level}): ~${sc.score} баллов`;
  }).filter(Boolean);
  const shareText = `Мои результаты в «Время сдавать»:\n${shareLines.join("\n")}\n\nГотовлюсь к экзамену с ИИ-наставником.`;
  const shareUrl = "https://vremyasdavat.ru";

  const openNet = (url) => { window.open(url, "_blank", "noopener,noreferrer"); setShareOpen(false); };
  const shareTelegram = () => openNet(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
  const shareVK = () => openNet(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent("Время сдавать")}&comment=${encodeURIComponent(shareText)}`);
  const shareWhatsApp = () => openNet(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`);
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareText + "\n" + shareUrl); setShared(true); setTimeout(() => setShared(false), 2500); } catch { /* ignore */ }
    setShareOpen(false);
  };
  const nativeShare = async () => {
    try { if (navigator.share) await navigator.share({ title: "Время сдавать", text: shareText, url: shareUrl }); } catch { /* cancelled */ }
    setShareOpen(false);
  };

  const openTutor = (topic, subjectKey) => {
    const s = SUBJECTS[subjectKey];
    setTutorTarget({ topic, exam: s.level, subjectKey });
    navigate("/chat");
  };

  return (
    <main className="page progress">
      <h1 className="progress__title">Мой прогресс</h1>

      {user ? (
        <div className="progress__profile">
          <div className="progress__avatar">{(user.name || user.email || "?").slice(0, 1).toUpperCase()}</div>
          <div className="progress__profile-main">
            <div className="progress__profile-name">{user.name || "Аккаунт"}</div>
            {user.email && <div className="progress__profile-email"><Mail size={13} /> {user.email}</div>}
          </div>
          <div className="progress__profile-actions">
            <Button size="sm" variant="soft" color={C.purple} onClick={() => navigate("/settings")}><Settings size={15} /> Настройки</Button>
            <Button size="sm" variant="soft" color={C.mut} onClick={logout}><LogOut size={15} /> Выйти</Button>
          </div>
        </div>
      ) : (
        <div className="progress__profile progress__profile--guest">
          <div className="progress__profile-guest-text">Войдите, чтобы сохранять прогресс между устройствами и заниматься с ИИ.</div>
          <Button size="sm" color={C.purple} onClick={() => navigate("/login?next=/progress")}>Войти</Button>
        </div>
      )}

      {keys.length === 0 ? (
        <div className="progress__empty">
          <div className="progress__empty-icon"><ClipboardList size={26} style={{ color: C.blue }} /></div>
          <h3 className="progress__empty-title">Вы ещё не проходили диагностику</h3>
          <p className="progress__empty-text">Пройдите короткий тест — и здесь появятся ваш прогноз балла и темы для подготовки.</p>
          <Button onClick={() => navigate("/test")}>Пройти тест</Button>
        </div>
      ) : (
        <>
          <p className="progress__hint">Нажмите на предмет, чтобы открыть подготовку и настроить дату экзамена.</p>

          <div className="progress__list">
            {keys.map((subjectKey) => {
              const r = resultsBySubject[subjectKey];
              const s = SUBJECTS[subjectKey];
              const sc = scoreFor(subjectKey);
              const studied = studiedFor(subjectKey);
              const expanded = open === subjectKey;
              const headNum = sc.kind === "oge" ? sc.mark : sc.score;
              const headLabel = sc.kind === "oge" ? "оценка" : "балл ЕГЭ";

              return (
                <div key={subjectKey} className={`progress__item${expanded ? " progress__item--open" : ""}`}>
                  <button onClick={() => setOpen(expanded ? null : subjectKey)} className="progress__head"
                    style={{ "--sub-bg": s.bg, "--sub-acc": s.accent }}>
                    <div className="progress__head-icon"><s.Icon size={22} style={{ color: s.accent }} /></div>
                    <div className="progress__head-main">
                      <div className="progress__head-name">{s.name}</div>
                      <div className="progress__head-sub">{studied.length} из {r.weak.length} тем разобрано · {s.level}</div>
                    </div>
                    <div className="progress__head-score">
                      <div className="progress__head-num">{headNum}</div>
                      <div className="progress__head-label">{headLabel}</div>
                    </div>
                    {expanded ? <ChevronUp size={20} className="progress__chev" /> : <ChevronDown size={20} className="progress__chev" />}
                  </button>

                  {expanded && (
                    <div className="progress__body">
                      <div className="progress__exam"><ExamBlock subjectKey={subjectKey} /></div>

                      <div className="progress__grid">
                        <div className="progress__score-col">
                          <ScoreView sc={sc} />
                          <div className="progress__stats-grid">
                            <Stat Icon={Award} c={C.green} bg={C.mintBg} value={`${studied.length}/${r.weak.length}`} label="тем разобрано" />
                            <Stat Icon={Flame} c={C.amber} bg={C.creamBg} value={`${r.correct}/${r.total}`} label="верно в тесте" />
                          </div>
                          <Button size="sm" variant="soft" color={s.accent} onClick={() => navigate(`/test/${subjectKey}`)} style={{ marginTop: 12 }}>Пересдать тест</Button>
                        </div>

                        <div>
                          <h3 className="progress__topics-title">Темы для подготовки</h3>
                          {r.weak.length === 0 ? (
                            <p className="progress__topics-empty">Слабых тем нет — отличный результат! 🎉</p>
                          ) : (
                            <div className="progress__topics">
                              {r.weak.map((t) => {
                                const done = studied.includes(t);
                                return (
                                  <div key={t} className={`progress__topic${done ? " progress__topic--done" : ""}`}>
                                    <span className="progress__topic-label">
                                      {done ? <CheckCircle2 size={18} style={{ color: C.green }} /> : <span className="progress__topic-radio" />}
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

          <div className="progress__share">
            <Share2 size={28} />
            <div className="progress__share-main">
              <h3 className="progress__share-title">Поделитесь результатами</h3>
              <p className="progress__share-text">Отправьте свой прогресс родителям или друзьям — пусть видят, как растёт балл.</p>
            </div>
            <Button color="#fff" style={{ color: C.blue }} onClick={() => setShareOpen(true)}>{shared ? "Скопировано ✓" : "Поделиться"}</Button>
          </div>

          {shareOpen && (
            <div className="share-modal" onClick={() => setShareOpen(false)}>
              <div className="share-modal__card" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal__title">Куда отправить результаты?</div>
                <div className="share-modal__grid">
                  <button className="share-modal__btn" onClick={shareTelegram}>
                    <span className="share-modal__ic" style={{ background: "#229ED9" }}><Send size={18} color="#fff" /></span>Telegram
                  </button>
                  <button className="share-modal__btn" onClick={shareVK}>
                    <span className="share-modal__ic" style={{ background: "#0077FF" }}><span className="share-modal__vk">VK</span></span>ВКонтакте
                  </button>
                  <button className="share-modal__btn" onClick={shareWhatsApp}>
                    <span className="share-modal__ic" style={{ background: "#25D366" }}><MessageCircle size={18} color="#fff" /></span>WhatsApp
                  </button>
                  <button className="share-modal__btn" onClick={copyShare}>
                    <span className="share-modal__ic share-modal__ic--muted"><Copy size={18} /></span>Скопировать
                  </button>
                </div>
                {typeof navigator !== "undefined" && navigator.share && (
                  <button className="share-modal__more" onClick={nativeShare}>Ещё способы…</button>
                )}
                <button className="share-modal__close" onClick={() => setShareOpen(false)}>Отмена</button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}