# План: Шаринг чатов, Персоны AI, Загрузка изображений

Реализуем три фичи: **#15 публичная ссылка на чат**, **#20 системные роли (персоны)**, **#21 multimodal — загрузка изображений**.

---

## 1. Персоны AI (#20) — самое простое, начнём с этого

Пользователь выбирает «роль» AI перед или во время разговора. Каждая роль — свой системный промпт.

**Персоны (на туркменском колорите):**
- **Kömekçi** (универсальный помощник) — по умолчанию
- **Mugallym** (учитель) — объясняет простыми словами, даёт примеры
- **Aşpez** (повар) — рецепты туркменской и мировой кухни
- **Taryhçy** (историк) — Туркменистан, Великий шёлковый путь, культура
- **Şahyr** (поэт) — пишет стихи, помогает с творчеством
- **Programmist** (программист) — код, архитектура, объяснения

**UI:**
- Дропдаун с иконкой персоны в `header` (рядом с `ThemeToggle`)
- На пустом чате (`EmptyChat`) — карточки персон вверху, клик меняет активную
- Активная персона отображается тонким лейблом под заголовком чата
- Выбор сохраняется в `localStorage` глобально + привязывается к чату при создании

**Технически:**
- Новый файл `src/data/personas.ts` — массив `{id, name, icon, description, systemPrompt}`
- В `Chat` тип добавить `personaId?: string`
- В `useChat.sendMessage` передавать `personaId` в edge function
- `supabase/functions/turkmen-chat/index.ts` принимает `personaId`, выбирает соответствующий системный промпт (общая база + специфика роли). Базовый блок «отвечай на туркменском + Maslahatlar в конце» сохраняется для всех

---

## 2. Загрузка изображений (#21) — multimodal

Пользователь прикрепляет фото к сообщению, AI его «видит» и отвечает по-туркменски.

**Use-cases:**
- Распознать туркменский текст с вывески/документа
- Описать ковёр, орнамент, блюдо
- Помочь с домашней работой по фото

**UI в `ChatInput`:**
- Кнопка-скрепка `Paperclip` слева от поля ввода
- При клике — file picker (`accept="image/*"`, max 4MB)
- Превью прикреплённой картинки над textarea с кнопкой ✕
- Drag & drop в зону ввода

**В сообщении (`ChatMessage`):**
- Если у user-сообщения есть `imageUrl` — рендерить картинку над текстом (rounded, max-w 320px, lightbox по клику опционально)

**Технически:**
- Картинку конвертируем в base64 data URL на клиенте (без отдельного хранилища — для MVP)
- Тип `Message` расширяем: `images?: string[]` (массив data URL)
- `useChat.sendMessage(content, images?)` — формирует контент в формате Gemini multimodal:
  ```
  { role: "user", content: [
    { type: "text", text: "..." },
    { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
  ]}
  ```
- Edge function: модель меняем на `google/gemini-2.5-flash` (поддерживает vision; текущий `gemini-3-flash-preview` — это `gemini-3.1-flash-image-preview`-семейство, лучше переключить на стабильную `2.5-flash` для multimodal-чата)
- В истории чата картинки храним только в текущей сессии; для сохранённой истории base64 не отправляем повторно (или отправляем — обсудимо, по умолчанию: да, отправляем — иначе AI «забудет» картинку)

**Ограничения, о которых сообщим в UI:**
- Максимум 1 картинка на сообщение (для MVP)
- До 4 МБ
- Только jpg/png/webp

---

## 3. Шаринг чата по публичной ссылке (#15)

Кнопка «Paýlaş» (Поделиться) копирует ссылку вида `/share/<token>` — любой по ней видит read-only версию диалога.

**Backend (Lovable Cloud):**

Таблица `shared_chats`:
```
id           uuid PK default gen_random_uuid()
share_token  text unique not null  -- короткий случайный токен в URL
title        text not null
messages     jsonb not null         -- снимок: [{role, content, images?}]
created_at   timestamptz default now()
```

**RLS:**
- `SELECT` для `anon, authenticated` через `share_token` — публичный доступ к снимкам
- `INSERT` для `anon, authenticated` — любой может создать снимок (rate limit реалистично не нужен для MVP)
- `UPDATE`/`DELETE` — запрещены (read-only снимки)

Так как авторизации в проекте нет, делаем чистый snapshot-подход: при шаринге сохраняем копию чата. Изменения в исходном чате не влияют на ссылку.

**Frontend:**
- Кнопка `Share2` в шапке (рядом с `ThemeToggle`), активна только когда есть `activeChat` с сообщениями
- Клик → insert в `shared_chats`, получаем `share_token`, копируем `${origin}${BASE_URL}share/${token}` в буфер, показываем toast «Salgy göçürildi»
- Новый роут `/share/:token` → компонент `SharedChat.tsx`:
  - Загружает по токену, рендерит `ChatMessage` в режиме read-only
  - Если не найдено → 404-state на туркменском
  - Шапка с лого + кнопка «Täze söhbet başla» (ведёт на `/` и создаёт новый чат)
- Прячем sidebar и input на shared-странице

---

## Технические детали и порядок работ

**Файлы и изменения:**

```text
[create] src/data/personas.ts
[create] src/pages/SharedChat.tsx
[edit]   src/types/chat.ts            — добавить images?, personaId?
[edit]   src/hooks/useChat.ts         — поддержка images, personaId
[edit]   src/components/ChatInput.tsx — attach button, превью изображения
[edit]   src/components/ChatMessage.tsx — рендер images
[edit]   src/components/EmptyChat.tsx — карточки персон сверху
[edit]   src/pages/Index.tsx          — селектор персоны, кнопка Share, передача personaId
[edit]   src/App.tsx                  — роут /share/:token
[edit]   supabase/functions/turkmen-chat/index.ts — personaId → system prompt; модель 2.5-flash для vision
[migration] create table shared_chats + RLS
```

**Зависимости:** новых пакетов не нужно.

**Порядок реализации (commit-by-commit):**
1. Персоны (UI + edge function)
2. Загрузка изображений (UI + multimodal в edge function, переключение модели на `gemini-2.5-flash`)
3. Шаринг (миграция + кнопка + страница `/share/:token`)

**Открытый вопрос:** в shared-снимке хранить картинки (base64) или вырезать их для уменьшения размера? Предлагаю **хранить** — иначе шаринг multimodal-разговоров теряет смысл. Если размер станет проблемой, позже добавим Storage bucket и будем грузить URL.

После одобрения переключусь в build-режим и реализую всё последовательно.