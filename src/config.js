/* Настройки бесплатного тарифа и напоминаний. */
export const FREE_DAILY_LIMIT = 20;        // (легаси) дефолтный лимит — используется как fallback
export const REMINDER_INTERVAL_DAYS = 4;   // как часто напоминать о подготовке к экзамену

/* Дневные лимиты сообщений к ИИ по тарифам (должны совпадать с api/_lib/plans.js). */
export const PLAN_LIMITS = { anon: 3, free: 20, standard: 200, premium: 100000 };
