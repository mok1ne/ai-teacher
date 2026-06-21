/* Сколько дней осталось до даты (по началу дня). */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const exam = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((exam - today) / 86400000);
}
/* Правильное склонение слова «день». */
export function pluralDays(n) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return "дней";
  if (b > 1 && b < 5) return "дня";
  if (b === 1) return "день";
  return "дней";
}
