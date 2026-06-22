import { Clock } from "lucide-react";
import { C } from "../theme";

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 40, padding: "26px 22px", background: "#FBFCFE" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center" }}>
            <Clock size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>Время сдавать</span>
        </div>
        <span style={{ fontSize: 13, color: C.soft }}>MVP-демо · подготовка к ЕГЭ и ОГЭ по проверенным источникам</span>
      </div>
    </footer>
  );
}
