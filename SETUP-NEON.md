# Подключение базы данных Neon

Бэкенд «Время сдавать» использует **Neon (serverless Postgres)**. Данные аккаунтов,
результаты и коды восстановления хранятся в БД. Без `DATABASE_URL` сервер работает
на временном хранилище в памяти (только для локальной проверки — данные не сохраняются).

## 1. Создать базу
1. На Vercel откройте проект → вкладка **Storage** → **Create Database** → **Neon**
   (или зарегистрируйтесь на neon.tech и создайте проект вручную).
2. Vercel сам добавит переменную окружения `DATABASE_URL` в проект.
   Если делаете вручную — скопируйте *Connection string* (с `?sslmode=require`)
   и добавьте в **Settings → Environment Variables** как `DATABASE_URL`.

## 2. Создать таблицы
Откройте в Neon **SQL Editor** и выполните содержимое файла [`db/schema.sql`](db/schema.sql).
(Таблицы: `users`, `reset_codes`, `progress`.)

## 3. Отправка писем (восстановление пароля)
Для реальной отправки кода на почту задайте переменные:
- `RESEND_API_KEY` — ключ [resend.com](https://resend.com) (бесплатный тариф есть).
- `MAIL_FROM` — адрес отправителя (после подтверждения домена, напр. `Время сдавать <noreply@vremyasdavat.ru>`).

Без `RESEND_API_KEY` код не отправляется письмом, а показывается прямо в интерфейсе
(демо-режим) — удобно для тестов.

## 4. Остальные переменные
`AUTH_SECRET` (подпись токенов), `ANTHROPIC_API_KEY` (чат), `VK_APP_ID` + `VK_SECURE_KEY`
и `VITE_VK_APP_ID` (вход через VK), `YOOKASSA_SHOP_ID` + `YOOKASSA_SECRET_KEY` (оплата).
Полный список — в `.env.example`.

## 5. Локальный запуск
```
npm install
vercel dev        # поднимет и фронтенд, и функции api/ с доступом к БД
```
(Обычный `npm run dev` запускает только фронтенд, без серверных функций.)

## Эндпоинты
- `POST /api/auth/register` — регистрация (email, пароль, имя, возраст)
- `POST /api/auth/login` — вход по email + пароль
- `POST /api/auth/vk` — вход через VK ID
- `GET  /api/auth/me` — профиль по токену
- `POST /api/auth/forgot/request` — отправить код на почту
- `POST /api/auth/forgot/verify` — проверить код, сменить пароль, автовход
- `POST /api/account/name` | `/password` | `/twofa` — настройки
- `GET/POST /api/progress` — загрузка/сохранение результатов на аккаунте
