/*
 * Баллы за тест.
 * Первичный балл = сумма весов (points) верно решённых заданий
 * (сложные задания дают больше баллов). Затем перевод по шкалам 2026:
 *   ЕГЭ → тестовый балл (0–100) по таблице; ОГЭ → оценка (2–5) по границам.
 * Сумма весов в банке = максимуму первичных баллов, поэтому достижим весь диапазон.
 */

// ЕГЭ: index = первичный балл, значение = тестовый балл.
const EGE = {
  "math-ege": { max: 32, table: [0,6,11,17,22,27,34,40,46,52,58,64,70,72,74,76,78,80,82,84,86,88,90,92,94,95,96,97,98,99,100,100,100] },
  "russian-ege": { max: 50, table: [0,3,5,8,10,12,15,17,20,22,24,27,29,32,34,36,37,39,40,42,43,45,46,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,72,73,75,78,81,83,86,89,91,94,97,100] },
};
// ОГЭ: границы оценок по первичному баллу.
const OGE = {
  "math-oge": { max: 31, bands: [[22,5],[15,4],[8,3]] },
  "russian-oge": { max: 37, bands: [[33,5],[26,4],[15,3]] },
};

export function levelOf(subjectKey, fallback) {
  return fallback || (subjectKey && subjectKey.includes("-oge") ? "oge" : "ege");
}

// primary — уже посчитанный первичный балл (сумма весов верных ответов).
export function estimateScore(subjectKey, levelKey, primary, studied = 0) {
  const level = levelOf(subjectKey, levelKey);
  const base = (primary || 0) + studied;

  if (level === "oge") {
    const cfg = OGE[subjectKey] || OGE["math-oge"];
    const p = Math.max(0, Math.min(cfg.max, base));
    let mark = 2;
    for (const [th, m] of cfg.bands) { if (p >= th) { mark = m; break; } }
    return { kind: "oge", mark, primary: p, max: cfg.max, passed: mark >= 3 };
  }

  const cfg = EGE[subjectKey] || EGE["math-ege"];
  const p = Math.max(0, Math.min(cfg.max, base));
  return { kind: "ege", score: cfg.table[p] ?? 0, primary: p, max: cfg.max };
}
