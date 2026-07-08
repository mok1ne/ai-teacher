import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthVKCallback.scss";

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
    <main className="page vk-callback">
      {error ? (
        <>
          <p className="vk-callback__error">{error}</p>
          <button onClick={() => navigate("/login")} className="vk-callback__link">Вернуться ко входу</button>
        </>
      ) : (
        <div className="vk-callback__loading">
          <Loader2 size={30} className="spin vk-callback__loading-icon" />
          <span className="vk-callback__loading-text">Входим через VK…</span>
        </div>
      )}
    </main>
  );
}