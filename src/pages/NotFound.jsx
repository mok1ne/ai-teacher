import { useNavigate } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import { C } from "../theme";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="page" style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ maxWidth: 460 }}>
        <div style={{ margin: "0 auto 20px", width: 60 }}><Logo size={60} /></div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: "-.03em",
          background: `linear-gradient(120deg,${C.blue},${C.purple})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          404
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: "14px 0 8px", color: C.ink }}>Страница не найдена</h1>
        <p style={{ fontSize: 15.5, color: C.mut, margin: "0 0 26px", lineHeight: 1.5 }}>
          Кажется, время увело не туда. Такой страницы нет — но подготовка к экзамену на месте.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button onClick={() => navigate("/")}><Home size={17} /> На главную</Button>
          <Button variant="soft" color={C.purple} onClick={() => navigate("/test")}>Пройти диагностику <ArrowRight size={16} /></Button>
        </div>
      </div>
    </main>
  );
}
