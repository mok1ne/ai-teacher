/*
 * Перевод результата теста в баллы.
 * ПРИНЦИП: первичный балл = число верных ответов (1 задание = 1 первичный балл).
 * Затем первичный переводится по официальным шкалам Рособрнадзора 2026:
 *   ЕГЭ → тестовый балл (0–100) по таблице перевода;
 *   ОГЭ → оценка (2–5) по границам первичных баллов.
 * Поэтому число заданий в банке = максимуму первичных баллов предмета
 * (мат-ЕГЭ 32, рус-ЕГЭ 50, мат-ОГЭ 31, рус-ОГЭ 37) — чтобы был достижим весь диапазон.
 * Разобранные темы добавляют первичные баллы (бонус за подготовку).
 */

// ЕГЭ: index = первичный балл, значение = тестовый балл (таблицы 2026).
const EGE = {
  "math-ege": { max: 32, table: [0,6,11,17,22,27,34,40,46,52,58,64,70,72,74,76,78,80,82,84,86,88,90,92,94,95,96,97,98,99,100,100,100] },
  "russian-ege": { max: 50, table: [0,3,5,8,10,12,15,17,20,22,24,27,29,32,34,36,37,39,40,42,43,45,46,48,49,51,52,54,55,57,58,60,61,63,64,66,67,69,70,72,73,75,78,81,83,86,89,91,94,97,100] },
};

// ОГЭ: границы оценок по первичному баллу (первичный >= порог → оценка).
const OGE = {
  "math-oge": { max: 31, bands: [[22,5],[15,4],[8,3]] },     // «5»22-31 «4»15-21 «3»8-14
  "russian-oge": { max: 37, bands: [[33,5],[26,4],[15,3]] },  // «5»33-37 «4»26-32 «3»15-25
};

export function levelOf(subjectKey, fallback) {
  return fallback || (subjectKey && subjectKey.includes("-oge") ? "oge" : "ege");
}

export function estimateScore(subjectKey, levelKey, correct, total, studied = 0) {
  const level = levelOf(subjectKey, levelKey);
  const percent = total ? Math.round((correct / total) * 100) : 0;

  if (level === "oge") {
    const cfg = OGE[subjectKey] || OGE["math-oge"];
    const primary = Math.max(0, Math.min(cfg.max, correct + studied));
    let mark = 2;
    for (const [th, m] of cfg.bands) { if (primary >= th) { mark = m; break; } }
    return { kind: "oge", mark, primary, max: cfg.max, percent, correct, total, passed: mark >= 3 };
  }

  const cfg = EGE[subjectKey] || EGE["math-ege"];
  const primary = Math.max(0, Math.min(cfg.max, correct + studied));
  const score = cfg.table[primary] ?? 0;
  return { kind: "ege", score, primary, max: cfg.max, percent, correct, total };
}
