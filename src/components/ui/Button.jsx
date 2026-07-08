import { C } from "../../theme";
import "./Button.scss";

export default function Button({ children, onClick, color = C.blue, variant = "solid", size = "md", style = {}, disabled }) {
  const cls = ["btn", `btn--${variant}`, size !== "md" ? `btn--${size}` : "", disabled ? "btn--disabled" : ""].filter(Boolean).join(" ");
  return (
    <button className={cls} disabled={disabled} onClick={onClick} style={{ "--btn-color": color, ...style }}>
      {children}
    </button>
  );
}
