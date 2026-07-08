import { Brain } from "lucide-react";
import "./ChatBubble.scss";

export default function ChatBubble({ role, text, typing }) {
  const isUser = role === "user";
  return (
    <div className={`chat-bubble${isUser ? " chat-bubble--user" : ""}`}>
      {!isUser && <div className="chat-bubble__avatar"><Brain size={16} color="#fff" /></div>}
      <div className="chat-bubble__body">
        {typing
          ? <span className="chat-bubble__dots">{[0, 1, 2].map((d) => <span key={d} className="dot" style={{ animationDelay: `${d * .18}s` }} />)}</span>
          : text}
      </div>
    </div>
  );
}