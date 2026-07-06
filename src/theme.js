/* Палитра. Бренд-цвета — фиксированные (одинаково на светлой/тёмной, участвуют
   в конкатенации с alpha, напр. accent+"33"). Фоновые/текстовые — CSS-переменные,
   которые меняются по теме (значения — в styles/global.css). */
export const C = {
  blue: "#2563EB", blueDk: "#1D4ED8", purple: "#7C3AED", purpleDk: "#6D28D9",
  green: "#16A34A", greenDk: "#15803D", amber: "#F59E0B", amberDk: "#D97706",
  ink: "var(--ink)", sub: "var(--sub)", mut: "var(--mut)", soft: "var(--soft)",
  line: "var(--line)", card: "var(--card)", track: "var(--track)", bg: "var(--bg)",
  blueBg: "var(--blueBg)", mintBg: "var(--mintBg)", lavBg: "var(--lavBg)", creamBg: "var(--creamBg)",
};
