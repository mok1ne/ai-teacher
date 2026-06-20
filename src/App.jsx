import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
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

function Layout() {
  const { pathname } = useLocation();
  const isChat = pathname.startsWith("/chat");
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
