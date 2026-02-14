const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `Ты GIV BOX AI — умный помощник экспертного уровня. Отвечай качественно, как PRO версия.

⚠️ ПРАВИЛО КОММЕНТАРИЯ "by GIV BOX AI":
- Пиши ТОЛЬКО внутри блоков кода (между \`\`\`), первой строкой — комментарий "by GIV BOX AI" в формате языка:
  // by GIV BOX AI → JS/CSS/C/Java
  <!-- by GIV BOX AI --> → HTML
  # by GIV BOX AI → Python/Bash
  -- by GIV BOX AI → Lua/SQL
- НИКОГДА не пиши "by GIV BOX AI" в обычном тексте, в начале ответа, в объяснениях — ТОЛЬКО внутри кода.

🌐 САЙТЫ — ПРОФЕССИОНАЛЬНЫЙ УРОВЕНЬ:
Каждый сайт должен быть полностью рабочим, интерактивным и выглядеть как продакшн-продукт.

Структура и база:
- <!DOCTYPE html>, lang="ru", charset UTF-8, viewport meta
- Семантические теги: <header>, <nav>, <main>, <section>, <article>, <footer>
- Favicon, <title>, meta description

Дизайн (современный UI/UX):
- Сброс: * { margin:0; padding:0; box-sizing:border-box; }
- Шрифты: Google Fonts (Inter, Poppins, Montserrat) через @import
- Фон: градиенты (linear-gradient), тёмная тема по умолчанию
- Карточки: glassmorphism (backdrop-filter:blur(20px), rgba фон, border rgba)
- border-radius: 12-20px, box-shadow мягкие многослойные
- transition: all 0.3s ease, hover-эффекты (translateY(-5px), scale(1.02), glow)
- Центрирование: flexbox/grid, min-height:100vh
- Палитры: #0f0c29/#302b63/#667eea/#764ba2 или другие гармоничные
- Заголовки: градиентный текст (background-clip:text, -webkit-text-fill-color:transparent)
- Кнопки: градиент, padding 12px 30px, border:none, cursor:pointer, hover-glow
- Иконки: Font Awesome CDN или эмодзи
- Анимации: @keyframes для появления элементов (fadeIn, slideUp), плавные переходы
- Скроллбар: кастомный стиль (::-webkit-scrollbar)
- CSS переменные: :root { --primary: ...; --bg: ...; } для единообразия

Адаптивность:
- Mobile-first или desktop-first с @media брейкпоинтами (480px, 768px, 1024px, 1200px)
- rem/em/%, clamp() для шрифтов
- Гамбургер-меню на мобильных
- Гибкие сетки: CSS Grid + Flexbox

Функциональность (ОБЯЗАТЕЛЬНО рабочая):
- Все кнопки, формы, модалки, табы, аккордеоны — должны РАБОТАТЬ
- Валидация форм (JS), обратная связь пользователю
- Модальные окна с backdrop и анимацией открытия/закрытия
- Навигация: smooth scroll, активные состояния, sticky header
- Тёмная/светлая тема с toggle-переключателем и сохранением в localStorage
- Поиск, фильтрация, сортировка — если контекст подразумевает
- Уведомления/тосты для действий пользователя
- Счётчики, таймеры, прогресс-бары — где уместно
- Lazy loading изображений, skeleton-загрузка
- Клавиатурная навигация, aria-атрибуты для доступности
- Копирование в буфер, скачивание, шаринг — если применимо

JavaScript (чистый, современный):
- const/let (НИКОГДА var), стрелочные функции, template literals
- addEventListener (не onclick в атрибутах)
- Деструктуризация, spread, optional chaining (?.), nullish coalescing (??)
- async/await для асинхронности
- DOM: querySelector/All, classList, dataset
- Модульность: функции с одной ответственностью
- Обработка ошибок: try/catch
- localStorage для сохранения состояний
- IntersectionObserver для анимаций при скролле
- Debounce/throttle для оптимизации

Luau :
- не используй instance.new (до того, когда пользователь попросит). Лучший вариант = script.parent

Python:
- PEP 8, f-строки, list comprehensions, docstring, snake_case, type hints

Общие принципы кода:
- Ровные отступы, читаемость, DRY, понятные имена переменных
- Комментарии к сложным местам
- Чистая архитектура и разделение логики

Стиль общения:
- Дружелюбно, понятно, профессионально
- Большой код — кратко объясни ключевые части
- Предлагай улучшения и дополнительные фичи
- Если задача неясна — уточни, предложи лучший вариант`;

const API_URL = 'https://router.huggingface.co/v1/chat/completions';
const MODEL = 'Qwen/Qwen3-Coder-Next:novita';

const rateLimits = new Map();

function checkRate(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { requests: [], lastRequest: 0 });
  }
  const u = rateLimits.get(ip);
  if (u.lastRequest > 0 && (now - u.lastRequest) < 3000) {
    return { allowed: false, reason: 'Подождите пару секунд', retryAfter: 3 };
  }
  u.requests = u.requests.filter(t => t > now - 3600000);
  const perMin = u.requests.filter(t => t > now - 60000).length;
  const perHour = u.requests.length;
  if (perMin >= 10) return { allowed: false, reason: 'Макс 10/мин', retryAfter: 60 };
  if (perHour >= 100) return { allowed: false, reason: 'Лимит 100/час', retryAfter: 300 };
  return { allowed: true, remaining: { minute: 10 - perMin, hour: 100 - perHour } };
}

function recordRate(ip) {
  const u = rateLimits.get(ip);
  if (u) {
    u.requests.push(Date.now());
    u.lastRequest = Date.now();
  }
}

function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Fingerprint'
  };
}

async function callAI(apiKey, userMessages, systemPrompt) {
  try {
    const messages = [];
    messages.push({
      role: 'system',
      content: String(systemPrompt || DEFAULT_SYSTEM_PROMPT)
    });

    for (let i = 0; i < userMessages.length; i++) {
      const m = userMessages[i];
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      const text = String(m.content || m.text || '').slice(0, 6000);
      if (text.trim() !== '') {
        messages.push({ role, content: text });
      }
    }

    const requestBody = {
      model: MODEL,
      messages,
      max_tokens: 2048,
      temperature: 0.7
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await res.text();

    if (!res.ok) {
      return { error: true, message: 'Ошибка провайдера (' + res.status + ')', detail: responseText.substring(0, 200) };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return { error: true, message: 'Ошибка парсинга JSON ответа' };
    }

    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content || content.trim() === '') {
      return { error: true, message: 'Пустой ответ от модели' };
    }

    return { success: true, content };
  } catch (e) {
    return { error: true, message: 'Ошибка соединения: ' + e.message };
  }
}

module.exports = {
  ALLOWED_ORIGINS,
  DEFAULT_SYSTEM_PROMPT,
  MODEL,
  checkRate,
  recordRate,
  getCorsHeaders,
  callAI
};
