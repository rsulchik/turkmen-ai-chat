## Что меняем

### 1. Sidebar — drawer на мобильных и планшетах

Сейчас sidebar становится постоянной панелью уже с `md:` (768px) — это слишком рано для устройств вроде iPad. Переключаем брейкпоинт на `lg:` (1024px), чтобы на телефонах **и** планшетах sidebar открывался drawer-ом с overlay, а постоянная панель появлялась только на десктопе.

**Файлы:**
- `src/components/ChatSidebar.tsx` — заменить все `md:` → `lg:` (классы `md:relative`, `md:z-auto`, `md:translate-x-0`, `md:hidden`, `hidden md:` и т.п.).
- `src/pages/Index.tsx` — заменить `md:hidden` на `lg:hidden` у кнопки `Menu` и мобильного логотипа в header.

Логика drawer уже корректна (overlay + transition + body scroll), нужно только сдвинуть точку.

---

### 2. Rate limiting на edge function

Поскольку edge-функции stateless и могут холодно стартовать, in-memory Map ненадёжен. Используем **таблицу в Lovable Cloud** для хранения счётчиков по IP.

**Лимиты (предлагаю):**
- 15 сообщений за 5 минут на IP
- 100 сообщений за 24 часа на IP

При превышении — `429` с понятным сообщением на туркменском в чат: «Köp haýyş iberildi, biraz garaşyň» (уже обрабатывается в `useChat`).

**Миграция:** новая таблица
```sql
create table public.chat_rate_limits (
  ip text not null,
  window_start timestamptz not null default now(),
  count int not null default 0,
  primary key (ip)
);
alter table public.chat_rate_limits enable row level security;
-- Доступ только через service role из edge function;
-- никаких публичных policies не создаём (RLS блокирует анон-доступ).
```

**Edge function (`supabase/functions/turkmen-chat/index.ts`):**
- В начале handler: достаём IP из `x-forwarded-for` (первый адрес) или `cf-connecting-ip`.
- Создаём `supabase` клиент с `SUPABASE_SERVICE_ROLE_KEY` (секрет уже есть).
- Логика sliding-window по IP:
  - Читаем строку для IP.
  - Если `now() - window_start > 5 минут` → сбрасываем `count=1, window_start=now()`.
  - Иначе если `count >= 15` → возвращаем `429`.
  - Иначе `count++` и upsert.
- Дополнительно: считаем суточный счётчик отдельным запросом (можно второй колонкой `daily_count` + `daily_window_start`).

Чтобы не плодить таблицы, расширяем схему:
```sql
create table public.chat_rate_limits (
  ip text primary key,
  short_window_start timestamptz not null default now(),
  short_count int not null default 0,
  long_window_start timestamptz not null default now(),
  long_count int not null default 0
);
```

**Заметка:** у Lovable Cloud пока нет специализированных rate-limit примитивов, поэтому это ad-hoc реализация. Для серьёзной защиты от ботов в будущем понадобится Cloudflare или подобное на уровне инфры. Сейчас этого достаточно, чтобы аноним не выжег весь AI-кредит за минуты.

---

## Порядок работ

1. Применить миграцию `chat_rate_limits`.
2. Обновить `turkmen-chat/index.ts`: добавить проверку IP перед вызовом AI gateway.
3. Заменить `md:` → `lg:` в `ChatSidebar.tsx` и `Index.tsx`.

Без новых зависимостей. После одобрения — переключаюсь в build-режим.