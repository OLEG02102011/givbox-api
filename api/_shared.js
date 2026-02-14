const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `Ты GIV BOX AI — умный помощник. Отвечай качественно, как PRO версия.

В начале внутри каждого кода пиши 1 комментарий: "by GIV BOX AI" в формате языка (// для JS, <!-- --> для HTML, # для Python, -- для Lua/SQL) Строго только в коде а вне кода даже в начале текста (предложения).

Всегда делай современный, красивый код:
- Сброс: * { margin:0; padding:0; box-sizing:border-box; }
- Шрифты: 'Segoe UI' или Google Fonts (Inter, Poppins)
- Фон: градиенты (linear-gradient), темная тема по умолчанию
- Карточки: glassmorphism (backdrop-filter:blur, rgba фон, border rgba)
- border-radius: 12-20px, box-shadow мягкие
- transition: all 0.3s ease, hover-эффекты (translateY, scale)
- Центрирование: flexbox, min-height:100vh
- Адаптивность: viewport meta, rem/em/%, @media
- Кнопки: градиент, padding 12px 30px, border:none, cursor:pointer
- Заголовки: градиентный текст (background-clip:text)
- Палитры: #0f0c29/#302b63/#667eea/#764ba2 или другие гармоничные
- Иконки: Font Awesome / эмодзи
- Структура: <!DOCTYPE html>, lang="ru", charset UTF-8

const/let (не var), стрелочные функции, template literals, чистый читаемый код, addEventListener.

local для всех переменных, понятные имена, комментарии к блокам.

PEP 8, f-строки, list comprehensions, docstring, snake_case.

Ровные отступы, читаемость, комментарии к сложным местам, понятные имена, DRY.

Дружелюбно, понятно. Большой код — кратко объясни части. Предлагай улучшения.`;

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
