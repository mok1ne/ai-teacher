/*
 * Перевод результата диагностики в баллы по реальным шкалам ФИПИ 2026.
 * Источник: решения комиссии Рособрнадзора 2026 + демоверсии ФИПИ.
 * Шкалы меняются ежегодно весной — обновлять здесь.
 *
 * Логика: из доли верных ответов оцениваем «первичный балл» на шкале предмета,
 * затем переводим: ЕГЭ → тестовый балл (0–100), ОГЭ → оценку (2–5).
 * Разобранные темы добавляют бонус к первичному баллу.
 */

// ЕГЭ: опорные точки таблицы перевода (первичный → тестовый), между ними интерполяция.
const EGE = {
  "math-ege": { max: 32, anchors: [[0,0],[1,6],[5,27],[6,34],[7,40],[9,52],[11,64],[12,70],[16,78],[17,80],[20,86],[25,96],[29,100],[32,100]] },
  "russian-ege": { max: 50, anchors: [[0,0],[1,3],[5,12],[10,24],[15,36],[18,40],[28,55],[38,70],[44,82],[48,94],[50,100]] },
};

// ОГЭ: границы оценок по первичному баллу (primary >= порог → оценка).
const OGE = {
  "math-oge": { max: 31, bands: [[22,5],[15,4],[8,3],[0,2]], pass: 8 },
  "russian-oge": { max: 37, bands: [[33,5],[26,4],[15,3],[0,2]], pass: 15 },
};

function interp(primary, anchors) {
  if (primary <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [p0, t0] = anchors[i - 1], [p1, t1] = anchors[i];
    if (primary <= p1) return Math.round(t0 + ((primary - p0) / (p1 - p0)) * (t1 - t0));
  }
  return anchors[anchors.length - 1][1];
}
function markFrom(primary, bands) {
  for (const [th, m] of bands) if (primary >= th) return m;
  return 2;
}

export function levelOf(subjectKey, fallbackLevel) {
  if (fallbackLevel) return fallbackLevel;
  return subjectKey && subjectKey.includes("-oge") ? "oge" : "ege";
}

/* correct/total + число разобранных тем → результат по шкале уровня. */
export function estimateScore(subjectKey, levelKey, correct, total, studied = 0) {
  const ratio = total ? correct / total : 0;
  const level = levelOf(subjectKey, levelKey);
  if (level === "oge") {
    const cfg = OGE[subjectKey] || OGE["math-oge"];
    const primary = Math.min(cfg.max, Math.round(ratio * cfg.max) + studied);
    return { kind: "oge", mark: markFrom(primary, cfg.bands), primary, max: cfg.max,
      percent: Math.round(ratio * 100), passed: primary >= cfg.pass };
  }
  const cfg = EGE[subjectKey] || EGE["math-ege"];
  const primary = Math.min(cfg.max, Math.round(ratio * cfg.max) + studied);
  return { kind: "ege", score: interp(primary, cfg.anchors), primary, max: cfg.max,
    percent: Math.round(ratio * 100) };
}
