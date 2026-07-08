import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, ClipboardList, MessageCircle, BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import "./MobileNav.scss";

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
    <nav className="mobile-nav">
      {items.map(({ to, label, Icon }) => (
        <Link key={to} to={to} onClick={() => to === "/chat" && setTutorTarget(null)}
          className={`mobile-nav__item${is(to) ? " mobile-nav__item--active" : ""}`}>
          <Icon size={21} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
