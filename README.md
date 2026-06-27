# Время сдавать — ИИ-репетитор для ЕГЭ и ОГЭ (MVP)

Лендинг → бесплатная диагностика → прогноз балла и слабые темы → разбор с ИИ-репетитором (с привязкой к источникам ФИПИ, поддержкой ученика и лимитами) → прогресс по каждому предмету → вход (VK / почта) → подписка через ЮKassa.

Стек: **React 18 + Vite + React Router**, иконки **lucide-react**. Состояние — React Context. Бэкенд — serverless-функции в папке `api/` (формат Vercel). Вызов ИИ изолирован в одном слое (модель-агностичный).

---

## Структура

```
vremya-sdavat/
├── api/                       # серверные функции (ключи только здесь)
│   ├── chat.js                # прокси к ИИ + лимит по аккаунту/IP
│   ├── _lib/                  # auth (токены), limiter, plans
│   ├── auth/                  # email.js, vk.js, me.js
│   └── payment/               # create.js (ЮKassa), webhook.js
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                # SPA-маршрутизация + /api
├── .env.example
└── src/
    ├── App.jsx                # роутинг + раскладка (sticky-футер)
    ├── theme.js, config.js
    ├── styles/global.css      # сброс, адаптив, мобильный навбар, sticky-футер
    ├── context/
    │   ├── AppContext.jsx     # результаты/прогресс ПО ПРЕДМЕТАМ, экзамен, лимиты
    │   └── AuthContext.jsx    # пользователь, вход, выход
    ├── data/                  # subjects.js, knowledgeBase.js (ФИПИ)
    ├── lib/                   # api.js, auth.js, storage.js, date.js
    ├── components/            # Header, MobileNav, Footer, ExamReminder, ui/…
    └── pages/                 # Home, SubjectPicker, Test, Results, Tutor,
                               # Progress, Parent, Login, AuthVKCallback, Legal
```

---

## Запуск

Нужен **Node.js 18+**.

```bash
npm install
npm run dev        # фронтенд: http://localhost:5173
```

> ⚠️ В `npm run dev` НЕ работают функции `/api/*` (чат, вход, оплата). Чтобы они
> работали локально — запускайте через `vercel dev` (см. ниже) или деплойте.

Сборка: `npm run build` (→ `dist/`), предпросмотр: `npm run preview`.

---

## Переменные окружения (`.env.example`)

| Переменная | Зачем |
|---|---|
| `ANTHROPIC_API_KEY` | ключ ИИ (только на сервере) |
| `AUTH_SECRET` | подпись сессионных токенов (длинная случайная строка) |
| `VK_APP_ID`, `VK_SECURE_KEY` | VK-приложение (обмен кода на токен на сервере) |
| `VITE_VK_APP_ID` | тот же ID VK — нужен фронту для редиректа |
| `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | приём оплаты ЮKassa |

---

## Авторизация (VK ID + почта)

- Воронка **поэтапная**: тест и первые 3 сообщения ИИ — анонимно (крючок). Дальше предлагаем вход.
- **VK ID** — основной способ (`src/context/AuthContext.jsx` → `loginVK` → редирект на `oauth.vk.com`; возврат на `/auth/vk/callback`; сервер `api/auth/vk.js` меняет `code` на токен). Реальный обмен включается, когда заданы `VK_APP_ID`/`VK_SECURE_KEY`; без них — демо-гость.
- **Почта** — `api/auth/email.js` (демо: сразу выдаёт сессию; в проде добавьте подтверждение почты кодом/ссылкой и БД).
- Сессия хранится токеном (`localStorage`), проверяется на сервере (`api/_lib/auth.js`, HMAC-подпись).

## Лимиты (защита бюджета)

- Сервер (`api/chat.js`) считает запросы **по аккаунту** (или по IP для анонимов) и режет лимитом тарифа (`api/_lib/plans.js`). Превышение → `429`, фронт показывает «войдите / откройте безлимит».
- Счётчик сейчас **in-memory** (`api/_lib/limiter.js`) — для прода замените на **Upstash Redis** (INCR + EXPIRE), иначе при нескольких инстансах лимит не общий.
- Клиентский счётчик в чате — только подсказка; главный страж — сервер.

## Оплата (ЮKassa)

- `Parent.jsx` → кнопка «Оформить» → `POST /api/payment/create` → редирект на форму ЮKassa.
- `api/payment/create.js` создаёт платёж (реальный вызов `api.yookassa.ru/v3/payments`, если заданы ключи; иначе демо-возврат). После оплаты — возврат на `/parent?paid=1`.
- `api/payment/webhook.js` — приём `payment.succeeded`; здесь нужно активировать подписку в БД (TODO).

---

## Деплой (Vercel)

```bash
npm i -g vercel
vercel dev         # локально с работающими /api
vercel --prod      # прод; задайте переменные окружения в дашборде
```

`vercel.json` уже отдаёт SPA-маршруты на `index.html`, а `/api/*` — на функции.

---

## Что доделать перед продом

- [ ] Подключить реальные ключи: Anthropic, VK-приложение, ЮKassa, `AUTH_SECRET`.
- [ ] Перенести лимит на **Upstash Redis** (сейчас in-memory).
- [ ] Почтовый вход: подтверждение владения почтой + хранение пользователей в БД.
- [ ] Webhook ЮKassa: активация подписки и связь тарифа с лимитом.
- [ ] Заменить `knowledgeBase.js` на полноценный RAG по материалам ФИПИ.
- [ ] Push-уведомления при закрытой вкладке (service worker + сервер).
- [ ] Юр.документы (`/legal/*`) — заменить шаблоны на проверенный юристом текст.
- [ ] Открыть остальные предметы, расширить банк вопросов, добавить реальные иллюстрации.

---

© «Время сдавать» — MVP. Подготовка к ЕГЭ и ОГЭ по проверенным источникам.
