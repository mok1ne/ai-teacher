import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { store } from "./lib/storage";
import { daysUntil, pluralDays } from "./lib/date";
import { REMINDER_INTERVAL_DAYS } from "./config";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SubjectPicker from "./pages/SubjectPicker";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Tutor from "./pages/Tutor";
import Progress from "./pages/Progress";
import Parent from "./pages/Parent";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import AuthVKCallback from "./pages/AuthVKCallback";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";

/* Локальное напоминание при заходе (рабочая MVP-версия). Полноценный пуш при
   закрытой вкладке потребует service worker + сервер — см. README. */
function useExamReminder() {
  useEffect(() => {
    const examDates = store.get("vs_examDates", {});
    const notify = store.get("vs_notify", false);
    if (!notify) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    // ближайший предстоящий экзамен среди всех предметов
    let nearest = null;
    for (const dateStr of Object.values(examDates)) {
      const d = daysUntil(dateStr);
      if (d != null && d >= 0 && (nearest === null || d < nearest)) nearest = d;
    }
    if (nearest === null) return;

    const last = store.get("vs_lastReminder", 0);
    const now = Date.now();
    if (now - last >= REMINDER_INTERVAL_DAYS * 86400000) {
      try {
        new Notification("Время сдавать", { body: `До ближайшего экзамена осталось ${nearest} ${pluralDays(nearest)}. Давай позанимаемся сегодня — хотя бы одну тему!` });
        store.set("vs_lastReminder", now);
      } catch { /* ignore */ }
    }
  }, []);
}

function Layout() {
  const { pathname } = useLocation();
  const isChat = pathname.startsWith("/chat");
  useExamReminder();
  return (
    <div className="app-shell" style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<SubjectPicker />} />
          <Route path="/test/:subjectKey" element={<Test />} />
          <Route path="/results" element={<Results />} />
          <Route path="/chat" element={<Tutor />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/parent" element={<Parent />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth/vk/callback" element={<AuthVKCallback />} />
          <Route path="/legal/:slug" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isChat && <Footer />}
      <MobileNav />
    </div>
  );
}

function LevelNoticeModal() {
  const { user, level } = useAuth();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!user) return;
    const key = "vs_level_notice:" + user.id;
    try { if (!localStorage.getItem(key)) setShow(true); } catch { /* ignore */ }
  }, [user]);
  if (!show || !user) return null;
  const close = () => { try { localStorage.setItem("vs_level_notice:" + user.id, "1"); } catch { /* ignore */ } setShow(false); };
  const levelName = (level || "ege") === "oge" ? "ОГЭ" : "ЕГЭ";
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(11,16,32,.5)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--card)", borderRadius: 22, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 30px 80px -30px rgba(11,16,32,.6)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
        <h3 style={{ fontSize: 21, fontWeight: 800, margin: "0 0 8px" }}>Готовим вас к {levelName}</h3>
        <p style={{ fontSize: 15, color: "#5b667a", margin: "0 0 20px", lineHeight: 1.5 }}>
          Тесты и предметы подобраны под {levelName}. Уровень можно поменять в любой момент в <b>Настройках</b>.
        </p>
        <button onClick={close} style={{ width: "100%", padding: "13px", borderRadius: 12, border: 0, cursor: "pointer",
          background: "linear-gradient(120deg,#3b5bff,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "inherit" }}>
          Понятно
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Layout />
          <LevelNoticeModal />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}