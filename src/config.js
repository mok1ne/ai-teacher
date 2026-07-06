/* Настройки тарифов и напоминаний. */
export const FREE_WEEKLY_LIMIT = 10;       // free — строго 10 запросов к ИИ в неделю
export const REMINDER_INTERVAL_DAYS = 4;   // как часто напоминать о подготовке к экзамену

/* Лимиты сообщений к ИИ по тарифам (совпадают с api/_lib/plans.js). */
export const PLAN_LIMITS = { anon: 3, free: 10, standard: 200, premium: 100000 };
