import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
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
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      {!isChat && <Footer />}
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Layout />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
