import { sql, useDb } from "./db.js";

const mem = new Map();

export async function getProgress(userId) {
  if (!useDb) return mem.get(userId) || null;
  const r = await sql`SELECT results, studied, exam_dates FROM progress WHERE user_id = ${userId}`;
  return r[0] ? { results: r[0].results, studied: r[0].studied, examDates: r[0].exam_dates } : null;
}
export async function saveProgress(userId, { results = {}, studied = {}, examDates = {} }) {
  if (!useDb) { mem.set(userId, { results, studied, examDates }); return; }
  await sql`
    INSERT INTO progress (user_id, results, studied, exam_dates, updated_at)
    VALUES (${userId}, ${JSON.stringify(results)}::jsonb, ${JSON.stringify(studied)}::jsonb, ${JSON.stringify(examDates)}::jsonb, now())
    ON CONFLICT (user_id) DO UPDATE SET
      results = ${JSON.stringify(results)}::jsonb, studied = ${JSON.stringify(studied)}::jsonb,
      exam_dates = ${JSON.stringify(examDates)}::jsonb, updated_at = now()`;
}
