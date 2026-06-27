/* Хранение сессионного токена и заголовок авторизации для запросов. */
const KEY = "vs_token";
export const getToken = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch { /* ignore */ } };
export const authHeaders = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };
