import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { C } from "../theme";

const linkStyle = { textDecoration: "none", color: C.mut, fontSize: 13.5, lineHeight: 2 };

function Col({ title, items }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 8 }}>{title}</div>
      {items.map(([label, to]) => (
        <div key={label}><Link to={to} style={linkStyle}>{label}</Link></div>
      ))}
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, background: "#FBFCFE" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "34px 22px 26px" }}>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center" }}>
                <Clock size={17} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Время сдавать</span>
            </div>
            <p style={{ fontSize: 13.5, color: C.mut, lineHeight: 1.55, margin: 0 }}>
              ИИ-репетитор для подготовки к ЕГЭ и ОГЭ по проверенным источникам ФИПИ.
            </p>
          </div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <Col title="Навигация" items={[["Главная", "/"], ["Пройти тест", "/test"], ["Чат с ИИ", "/chat"], ["Мой прогресс", "/progress"]]} />
            <Col title="Документы" items={[["Публичная оферта", "/legal/offer"], ["Политика конфиденциальности", "/legal/privacy"], ["Согласие на обработку ПДн", "/legal/consent"]]} />
            <Col title="Контакты" items={[["Войти", "/login"], ["Тарифы", "/parent"]]} />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 24, paddingTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: C.soft }}>© {new Date().getFullYear()} «Время сдавать». MVP-демо.</span>
          <span style={{ fontSize: 12.5, color: C.soft }}>Сделано для подготовки к ЕГЭ и ОГЭ</span>
        </div>
      </div>
    </footer>
  );
}
