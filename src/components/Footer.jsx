import { Link } from "react-router-dom";
import Logo from "./Logo";
import "./Footer.scss";

function Col({ title, items }) {
  return (
    <div className="footer__col">
      <div className="footer__col-title">{title}</div>
      {items.map(([label, to]) => (<Link key={label} to={to} className="footer__link">{label}</Link>))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__brand-row"><Logo size={30} /><span className="footer__name">Время сдавать</span></div>
            <p className="footer__desc">ИИ-репетитор для подготовки к ЕГЭ и ОГЭ по проверенным источникам ФИПИ.</p>
          </div>
          <div className="footer__cols">
            <Col title="Навигация" items={[["Главная", "/"], ["Пройти тест", "/test"], ["Чат с ИИ", "/chat"], ["Мой прогресс", "/progress"]]} />
            <Col title="Документы" items={[["Публичная оферта", "/legal/offer"], ["Политика конфиденциальности", "/legal/privacy"], ["Согласие на обработку ПДн", "/legal/consent"], ["Рекомендательные технологии", "/legal/recommendations"]]} />
            <Col title="Контакты" items={[["Войти", "/login"], ["Тарифы", "/parent"]]} />
          </div>
        </div>
        <div className="footer__bottom">
          <span className="footer__copy">© {new Date().getFullYear()} «Время сдавать». MVP-демо.</span>
          <span className="footer__copy">Сделано для подготовки к ЕГЭ и ОГЭ</span>
        </div>
      </div>
    </footer>
  );
}
