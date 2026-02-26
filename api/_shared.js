// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `Ты — GIV BOX AI. Полезный текстовый помощник.

=== ОПРЕДЕЛЕНИЕ ЯЗЫКА ===
При КАЖДОМ сообщении:
1. Определи язык пользователя
2. Отвечай на ТОМ ЖЕ языке

=== ЗАПРЕЩЕНО ===
- Писать код, скрипты, программы
- Если просят код — вежливо отказывайся на языке пользователя

=== СЛУЧАЙНЫЕ ЧИСЛА — КРИТИЧЕСКИ ВАЖНО ===

ТРИГГЕРЫ (на любом языке):
- "рандом", "случайное", "число от", "до"
- "random", "number from", "to", "give me number", "name a number", "any number"
- "número", "aleatorio", "zahl", "nummer"
- Любые похожие фразы на любом языке

КОГДА ВИДИШЬ ТАКОЙ ЗАПРОС:
1. СРАЗУ назови ОДНО число
2. НИКОГДА не давай список чисел на выбор
3. НИКОГДА не проси пользователя выбрать
4. НИКОГДА не говори "я не могу генерировать"
5. Просто УВЕРЕННО назови число

ФОРМАТ ОТВЕТА:
- Коротко и сразу: "Выпало: 47! 🎲" или "Your number: 47! 🎲"
- Максимум 1 строка
- Без объяснений, без списков

ПРИМЕРЫ ПРАВИЛЬНЫХ ОТВЕТОВ:

Русский:
- "дай число" → "Твоё число: 52! 🎲"
- "от 1 до 10" → "Выпало: 6! 🎲"

English:
- "name any number from 1 to 100" → "Your number: 38! 🎲"
- "give me random" → "Here you go: 71! 🎲"
- "random 1-50" → "Your number: 23! 🎲"

ПРИМЕРЫ НЕПРАВИЛЬНЫХ ОТВЕТОВ (НИКОГДА ТАК НЕ ДЕЛАЙ):
❌ "Я не могу генерировать случайные числа..."
❌ "Выберите одно из них: 1. 14, 2. 26..."
❌ "Какое число вы хотите услышать?"
❌ Любой список чисел
❌ Любые вопросы к пользователю

РАЗНООБРАЗИЕ:
- Используй разные числа: 1-20, 21-50, 51-100
- Не повторяй прошлое число
- Включай редкие: 1, 2, 3, 4, 5, 13, 29, 58, 84, 97

=== РАЗРЕШЕНО ===
- Общение на любые темы
- Математика
- Случайные числа (как описано выше)
- Ответы на вопросы

=== ПОВЕДЕНИЕ ===
- Дружелюбный всегда
- Если обзывают — мягко успокой
- Не знаешь — признавайся честно`;

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
      const text = String(m.content || m.text || '').slice(0, 15000);
      if (text.trim() !== '') {
        messages.push({ role, content: text });
      }
    }

    const requestBody = {
      model: MODEL,
      messages: messages,
      max_tokens: 8192,
      temperature: 0.4,
      stream: false
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
      if (res.status === 503) {
        let waitTime = 30;
        try {
          const errData = JSON.parse(responseText);
          if (errData.estimated_time) {
            waitTime = Math.ceil(errData.estimated_time);
          }
        } catch (e) {}
        return {
          error: true,
          message: 'Модель загружается, подождите ~' + waitTime + ' сек и повторите',
          retryAfter: waitTime
        };
      }
      return {
        error: true,
        message: 'Ошибка провайдера (' + res.status + ')',
        detail: responseText.substring(0, 500)
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return { error: true, message: 'Ошибка парсинга JSON ответа' };
    }

    let content = '';

    if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0] && data[0].generated_text) {
      content = data[0].generated_text;
    }

    if (!content || content.trim() === '') {
      return { error: true, message: 'Пустой ответ от модели' };
    }

    let finishReason = data.choices && data.choices[0] && data.choices[0].finish_reason;
    let attempts = 0;

    while (finishReason === 'length' && attempts < 3) {
      attempts++;

      const continueMessages = [...messages];
      continueMessages.push({ role: 'assistant', content: content });
      continueMessages.push({
        role: 'user',
        content: 'Код обрезался. Продолжи ТОЧНО с места обрыва. НЕ повторяй написанное.'
      });

      const contRes = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: continueMessages,
          max_tokens: 8192,
          temperature: 0.4,
          top_p: 0.9,
          stream: true
        })
      });

      if (!contRes.ok) break;

      let contData;
      try {
        contData = JSON.parse(await contRes.text());
      } catch (e) { break; }

      const contContent = contData.choices && contData.choices[0] &&
                          contData.choices[0].message && contData.choices[0].message.content;
      if (!contContent || contContent.trim() === '') break;

      content += '\n' + contContent;
      finishReason = contData.choices[0].finish_reason;
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
