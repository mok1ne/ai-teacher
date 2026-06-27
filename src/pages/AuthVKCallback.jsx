import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function AuthVKCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeVK } = useAuth();
  const [error, setError] = useState("");
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const code = params.get("code");
    if (!code) { setError("Код авторизации не получен."); return; }
    completeVK(code)
      .then(() => navigate("/"))
      .catch(() => setError("Не удалось войти через VK. Попробуйте ещё раз."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="page" style={{ maxWidth: 460, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      {error ? (
        <>
          <p style={{ fontSize: 15.5, color: "#B91C1C", marginBottom: 16 }}>{error}</p>
          <button onClick={() => navigate("/login")} style={{ color: C.blue, background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
            Вернуться ко входу
          </button>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: C.mut }}>
          <Loader2 size={30} className="spin" style={{ color: C.blue }} />
          <span style={{ fontSize: 15 }}>Входим через VK…</span>
        </div>
      )}
    </main>
  );
}
