import { useNavigate } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Logo from "../components/Logo";
import { C } from "../theme";
import "./NotFound.scss";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="page notfound">
      <div className="notfound__inner">
        <div className="notfound__logo"><Logo size={60} /></div>
        <div className="notfound__code">404</div>
        <h1 className="notfound__title">Страница не найдена</h1>
        <p className="notfound__text">Кажется, время увело не туда. Такой страницы нет — но подготовка к экзамену на месте.</p>
        <div className="notfound__actions">
          <Button onClick={() => navigate("/")}><Home size={17} /> На главную</Button>
          <Button variant="soft" color={C.purple} onClick={() => navigate("/test")}>Пройти диагностику <ArrowRight size={16} /></Button>
        </div>
      </div>
    </main>
  );
}
