import React from "react";

/* Ловит ошибки рендера, чтобы вместо белого экрана показать понятное сообщение
   (с текстом ошибки — удобно для диагностики) и дать перезагрузить/сбросить. */
export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App crash:", error, info); }

  render() {
    if (!this.state.error) return this.props.children;
    const reset = () => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* ignore */ } window.location.href = "/"; };
    const box = { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "var(--bg)", color: "var(--ink)", fontFamily: "Inter, system-ui, -apple-system, sans-serif" };
    return (
      <div style={box}>
        <div style={{ maxWidth: 460, textAlign: "center" }}>
          <div style={{ fontSize: 44 }}>😕</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: "12px 0 8px" }}>Что-то пошло не так</h1>
          <p style={{ color: "var(--mut)", fontSize: 15, lineHeight: 1.5, margin: 0 }}>Приложение столкнулось с ошибкой. Перезагрузите страницу, а если не поможет — сбросьте данные.</p>
          <pre style={{ textAlign: "left", fontSize: 12, color: "var(--soft)", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: 12, marginTop: 14, overflow: "auto", whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <button onClick={() => window.location.reload()} style={{ padding: "12px 20px", borderRadius: 12, border: 0, cursor: "pointer", background: "linear-gradient(120deg,#3b5bff,#7c3aed)", color: "#fff", fontWeight: 700, fontFamily: "inherit" }}>Перезагрузить</button>
            <button onClick={reset} style={{ padding: "12px 20px", borderRadius: 12, cursor: "pointer", background: "transparent", color: "var(--mut)", border: "1.5px solid var(--line)", fontWeight: 600, fontFamily: "inherit" }}>Сбросить и выйти</button>
          </div>
        </div>
      </div>
    );
  }
}
