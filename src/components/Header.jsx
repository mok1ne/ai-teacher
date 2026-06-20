import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import Button from "./ui/Button";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

function NavItem({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{ textDecoration: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
      padding: "7px 12px", borderRadius: 9, color: active ? C.blue : C.sub, background: active ? C.blueBg : "transparent" }}>
      {label}
    </Link>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setTutorTarget } = useApp();
  const is = (p) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,.88)",
      backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "13px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", color: C.ink }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center" }}>
            <Clock size={19} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17 }}>Время сдавать</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.lavBg, padding: "2px 7px", borderRadius: 20 }}>MVP</span>
        </Link>
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <NavItem to="/" label="Главная" active={is("/")} />
          <NavItem to="/chat" label="Чат с ИИ" active={is("/chat")} onClick={() => setTutorTarget(null)} />
          <NavItem to="/progress" label="Мой прогресс" active={is("/progress")} />
          <Button size="sm" onClick={() => navigate("/test")}>Пройти тест</Button>
        </nav>
      </div>
    </header>
  );
}
