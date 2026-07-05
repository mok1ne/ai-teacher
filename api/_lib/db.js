import { neon } from "@neondatabase/serverless";

// Подключение к Neon (Postgres) через DATABASE_URL. Если переменной нет —
// используется временное хранилище в памяти (только для локальной разработки).
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
export const useDb = !!url;
export const sql = useDb ? neon(url) : null;
if (!useDb) console.warn("[db] DATABASE_URL не задан — временное хранилище в памяти (данные не сохраняются).");
