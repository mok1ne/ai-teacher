import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, ClipboardList, MessageCircle, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { C } from "../theme";

const items = [
  { to: "/", label: "Главная", Icon: HomeIcon },
  { to: "/test", label: "Тест", Icon: ClipboardList },
  { to: "/chat", label: "Чат", Icon: MessageCircle },
  { to: "/progress", label: "Прогресс", Icon: BarChart3 },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const { setTutorTarget } = useApp();
  const is = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <nav className="mobile-nav" style={{ position: "fixed", left: 0, right: 0, bottom: 0, height: 60,
      background: "var(--glass)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`,
      zIndex: 60, justifyContent: "space-around", alignItems: "center" }}>
      {items.map(({ to, label, Icon }) => {
        const active = is(to);
        return (
          <Link key={to} to={to} onClick={() => to === "/chat" && setTutorTarget(null)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              textDecoration: "none", color: active ? C.blue : C.soft, fontSize: 11, fontWeight: 600 }}>
            <Icon size={21} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}