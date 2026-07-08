import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Logo from "./Logo";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";
import "./Header.scss";

function NavItem({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} className={`header__navitem${active ? " header__navitem--active" : ""}`}>
      {label}
    </Link>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setTutorTarget } = useApp();
  const { user } = useAuth();
  const is = (p) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__brand">
          <Logo size={34} />
          <span className="header__name">Время сдавать</span>
          <span className="header__badge">MVP</span>
        </Link>
        <div className="header__actions">
          <nav className="desktop-nav header__nav">
            <NavItem to="/" label="Главная" active={is("/")} />
            <NavItem to="/chat" label="Чат с ИИ" active={is("/chat")} onClick={() => setTutorTarget(null)} />
            <NavItem to="/progress" label="Мой прогресс" active={is("/progress")} />
            <Button size="sm" onClick={() => navigate("/test")}>Пройти тест</Button>
          </nav>
          {!user && <Button size="sm" variant="soft" color={C.purple} onClick={() => navigate("/login")}>Войти</Button>}
        </div>
      </div>
    </header>
  );
}
