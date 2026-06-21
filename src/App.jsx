import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

/* Локальное напоминание при заходе: если разрешено и прошло >= N дней.
   Полноценный пуш, когда вкладка закрыта, потребует service worker + бэкенд —
   см. README. Здесь — рабочая MVP-версия (срабатывает при открытии сайта). */
function useExamReminder() {
  useEffect(() => {
    const examDate = store.get("vs_examDate", null);
    const notify = store.get("vs_notify", false);
    if (!examDate || !notify) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const d = daysUntil(examDate);
    if (d == null || d < 0) return;
    const last = store.get("vs_lastReminder", 0);
    const now = Date.now();
    if (now - last >= REMINDER_INTERVAL_DAYS * 86400000) {
      try {
        new Notification("Время сдавать", { body: `До экзамена осталось ${d} ${pluralDays(d)}. Давай позанимаемся сегодня — хотя бы одну тему!` });
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
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<SubjectPicker />} />
        <Route path="/test/:subjectKey" element={<Test />} />
        <Route path="/results" element={<Results />} />
        <Route path="/chat" element={<Tutor />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!isChat && <Footer />}
      <MobileNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}
