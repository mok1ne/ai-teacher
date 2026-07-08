import React from "react";
import "./ErrorBoundary.scss";

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("App crash:", error, info); }

  render() {
    if (!this.state.error) return this.props.children;
    const reset = () => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* ignore */ } window.location.href = "/"; };
    return (
      <div className="errbound">
        <div className="errbound__inner">
          <div className="errbound__emoji">😕</div>
          <h1 className="errbound__title">Что-то пошло не так</h1>
          <p className="errbound__text">Приложение столкнулось с ошибкой. Перезагрузите страницу, а если не поможет — сбросьте данные.</p>
          <pre className="errbound__pre">{String(this.state.error?.message || this.state.error)}</pre>
          <div className="errbound__actions">
            <button className="errbound__btn errbound__btn--primary" onClick={() => window.location.reload()}>Перезагрузить</button>
            <button className="errbound__btn errbound__btn--ghost" onClick={reset}>Сбросить и выйти</button>
          </div>
        </div>
      </div>
    );
  }
}
