import { Brain } from "lucide-react";
import { C } from "../theme";

export default function ChatBubble({ role, text, typing }) {
  const isUser = role === "user";
  return (
    <div style={{ alignSelf: isUser ? "flex-end" : "flex-start", maxWidth: "86%", display: "flex", gap: 9, flexDirection: isUser ? "row-reverse" : "row" }}>
      {!isUser && (
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg,${C.blue},${C.purple})`, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
          <Brain size={16} color="#fff" />
        </div>
      )}
      <div style={{ padding: "12px 16px", borderRadius: 16,
        borderTopLeftRadius: isUser ? 16 : 4, borderTopRightRadius: isUser ? 4 : 16,
        background: isUser ? C.blue : C.track, color: isUser ? "#fff" : C.ink,
        fontSize: 15, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {typing
          ? <span style={{ display: "inline-flex", gap: 4 }}>
              {[0, 1, 2].map((d) => <span key={d} className="dot" style={{ animationDelay: `${d * .18}s` }} />)}
            </span>
          : text}
      </div>
    </div>
  );
}
