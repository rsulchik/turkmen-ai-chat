# План: современный редизайн Turkmen AI Chat с туркменскими акцентами

## Концепция

Контрастная премиум-палитра, вдохновлённая туркменскими коврами: глубокий бордовый, изумрудно-зелёный и тёплое золото. Тонкий орнаментальный мотив **göl** (ромбовидный знак с теке-ковра) фоном в пустых состояниях и боковой панели — как водяной знак, чтобы чувствовалась национальная идентичность, но не «давила». Glassmorphism для шапки и сайдбара, плавные анимации появления сообщений, кастомное название в логотипе, переключатель light/dark.

## Палитра (semantic tokens, HSL)

**Light (по умолчанию)**
- background: тёплый молочно-белый
- primary: изумрудно-зелёный (туркменский флаг, `158 75% 32%`)
- accent: золотой (`38 85% 52%`)
- destructive-like акцент: бордовый (`350 70% 38%`)
- сайдбар: чуть теплее фона, граница — золотая полупрозрачная

**Dark**
- background: глубокий тёмно-зелёный почти чёрный (`160 25% 7%`)
- primary: яркий изумруд (`158 70% 48%`)
- accent: тёплое золото (`42 90% 60%`)
- carpet-red: бордовый (`350 65% 48%`)
- glassmorphism поверхности: `bg-card/60 backdrop-blur-xl`

Все цвета — через CSS-переменные в `index.css` + регистрация в `tailwind.config.ts`. Никаких хардкоженных классов в компонентах.

## Что меняется

### 1. Дизайн-система
- `src/index.css`: переписать оба набора токенов (`:root` и `.dark`), добавить градиенты `--gradient-primary`, `--gradient-gold`, `--gradient-hero` и тени `--shadow-glow`, `--shadow-elegant`. Подключить шрифт **Playfair Display** (заголовки/логотип) + оставить Inter (тело). Добавить SVG-фон `--carpet-pattern` (göl-ромб) data-uri для пустых состояний и сайдбара.
- `tailwind.config.ts`: добавить токены `carpet-red`, `gold`, `gold-foreground`, `glass`, утилиту градиентов через `backgroundImage`, ключевые кадры `fade-in-up`, `shimmer`.

### 2. Компоненты
- **Новый `ThemeToggle.tsx`**: переключение `dark`/`light` на `<html>`, сохранение в `localStorage`, иконки солнце/луна с плавной ротацией.
- **Новый `TurkmenLogo.tsx`**: SVG göl-ромб + текст «Turkmen AI» (Playfair, золотой градиент), используется в шапке и пустом экране.
- **Новый `OrnamentBackground.tsx`**: лёгкий повторяющийся SVG-узор göl, opacity ~5–8%, как фон в EmptyChat и сайдбаре.
- **`ChatSidebar.tsx`**: glassmorphism (`backdrop-blur-xl`, полупрозрачный фон), золотая граница-акцент справа, орнаментальный фон, активный чат с золотой левой полосой 2px и мягким glow.
- **`ChatMessage.tsx`**: framer-motion `motion.div` с `fade-in-up`, аватар AI получает золотой градиент-обводку, сообщения пользователя — пилюля с лёгким изумрудным фоном; сообщения AI на полупрозрачной карточке. Кнопка «Göçürmek» — всегда видна на мобильном, появляется на ховере на десктопе.
- **`ChatInput.tsx`**: контейнер на стекле с золотой подсветкой при фокусе (`focus-within:ring-2 ring-accent/40`), кнопка отправки — изумрудный градиент, иконка микрофона уже есть.
- **`EmptyChat.tsx`**: крупный логотип TurkmenLogo, орнаментальный фон, карточки-подсказки с тонкой золотой границей и hover-glow; добавить мини-подзаголовок с национальным колоритом («Söhbetdeşlik üçin akylly kömekçi»).
- **`TypingIndicator.tsx`**: точки в золотом цвете, вокруг аватара мягкое пульсирующее свечение.
- **`Index.tsx` (header)**: glassmorphism шапка (`bg-background/60 backdrop-blur-xl`), слева логотип + название чата, справа ThemeToggle.

### 3. HTML / мета
- `index.html`: title → «Turkmen AI Chat», description → краткое туркм. описание, `lang="tk"`.

## Технические детали

```
src/
├── index.css              ← новая палитра + градиенты + göl SVG-pattern
├── tailwind.config.ts     ← новые цвета, fade-in-up keyframes
├── components/
│   ├── ThemeToggle.tsx    ← НОВЫЙ
│   ├── TurkmenLogo.tsx    ← НОВЫЙ (SVG göl + текст)
│   ├── OrnamentBackground.tsx ← НОВЫЙ
│   ├── ChatSidebar.tsx    ← glassmorphism + орнамент + золотой акцент
│   ├── ChatMessage.tsx    ← framer-motion появление, новые стили
│   ├── ChatInput.tsx      ← стекло + золотой focus ring
│   ├── EmptyChat.tsx      ← логотип + орнамент + новые карточки
│   └── TypingIndicator.tsx ← золотые точки + glow
├── pages/Index.tsx        ← glass header + ThemeToggle
└── ../index.html          ← title/lang
```

framer-motion уже установлен. Тёмная тема — переключение класса `.dark` на `<html>`, по умолчанию dark (под палитру). 

ASCII-схема экрана:

```text
┌──────────────────────────────────────────────────────────┐
│ [glass header]  ◇ Turkmen AI · Söhbet adı       [☀/🌙]  │
├───────────────┬──────────────────────────────────────────┤
│ [glass side]  │                                          │
│ ◇ Söhbetler + │       (göl ornament fonom, 6%)           │
│  · Active ◆gld│        ◇ Turkmen AI                      │
│  · Chat 2     │   Söhbetdeşlik üçin akylly kömekçi       │
│  · Chat 3     │   ┌─────────┐ ┌─────────┐                │
│               │   │ podsk 1 │ │ podsk 2 │                │
│               │   └─────────┘ └─────────┘                │
│ ─göl pattern─ │                                          │
│  Resul Sopyy. │   [glass input ─────────── 🎤  ➤]        │
└───────────────┴──────────────────────────────────────────┘
```

## Что НЕ меняется
- Логика чата (`useChat`), edge-функция, словарь, голосовой ввод — без правок.
- shadcn UI компоненты не трогаем.
