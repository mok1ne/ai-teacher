/*
 * Хранилище данных. В проде — Upstash Redis (REST) или Vercel KV:
 * задайте UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN.
 * Без них используется временное хранилище в памяти (данные не переживают
 * перезапуск функции) — только чтобы код не падал в дев-режиме.
 */
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const useRedis = !!(URL_ && TOKEN);

const mem = new Map();
if (!useRedis) console.warn("[store] Redis не настроен — временное хранилище в памяти. Задайте UPSTASH_REDIS_REST_URL/TOKEN.");

async function redis(command) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error("redis_error");
  const d = await r.json();
  return d.result;
}

export async function kvGet(key) {
  if (!useRedis) return mem.has(key) ? mem.get(key) : null;
  const v = await redis(["GET", key]);
  return v == null ? null : JSON.parse(v);
}
export async function kvSet(key, value) {
  if (!useRedis) { mem.set(key, value); return; }
  await redis(["SET", key, JSON.stringify(value)]);
}
export async function kvDel(key) {
  if (!useRedis) { mem.delete(key); return; }
  await redis(["DEL", key]);
}
