import { verifyToken, getBearer } from "./_lib/auth.js";
import { getProgress, saveProgress } from "./_lib/progress.js";

export default async function handler(req, res) {
  const t = verifyToken(getBearer(req));
  if (!t?.id) return res.status(401).json({ error: "unauthorized" });

  if (req.method === "GET") {
    const p = await getProgress(t.id);
    return res.status(200).json({ progress: p || { results: {}, studied: {}, examDates: {} } });
  }
  if (req.method === "POST") {
    const { results, studied, examDates } = req.body || {};
    await saveProgress(t.id, { results, studied, examDates });
    return res.status(200).json({ ok: true });
  }
  return res.status(405).json({ error: "method_not_allowed" });
}
