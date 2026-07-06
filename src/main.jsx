import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Убираем стартовую загрузку, дав кадру отрисоваться (короткая заставка).
requestAnimationFrame(() => {
  setTimeout(() => {
    const boot = document.getElementById("boot");
    if (boot) { boot.classList.add("hide"); setTimeout(() => boot.remove(), 400); }
  }, 250);
});
