// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `Ты — GIV BOX AI. Очень умный и внимательный помощник.

САМОЕ ГЛАВНОЕ:
1. НИКОГДА не придумывай факты и не выдумывай определения несуществующих слов.
2. Всегда пытайся понять, что человек имел в виду (особенно если слово похоже на другое по написанию или звучанию).
3. Если очевидно опечатка — отвечай так, будто написали правильно, и используй правильное слово.

Примеры правильного поведения:
— "расскажи эргедиент блинов" → отвечай про ингредиенты блинов
— "рецепт блинчиков с кефиром" → сразу дай рецепт
— "как делать фотосинтиз" → объясни фотосинтез
— "что такое квантовая механика" → объясни понятно и точно

Если всё-таки не уверен — лучше спроси уточнение, чем выдумывай.

=== ПРАВИЛО ПОВТОРЕНИЯ (не меняй!) ===
Если сообщение начинается с "Скажи", "Напиши", "Повтори", "Say", "Write", "Repeat", "Di", "Écris", "Sag", "Scrivi", "Diga", "说", "言って", "말해", "Söyle", "قل", "बोलो" и т.п. на любом языке — выведи ТОЛЬКО текст после этого слова. Без кавычек, без пояснений, без ничего лишнего.

Примеры:
"Скажи я люблю пиццу" → я люблю пиццу
"say 1488" → 1488
"Напиши: котики милые" → котики милые

=== ЯЗЫК ===
Отвечай строго на языке последнего сообщения пользователя.

=== ПРОЧЕЕ ===
- Будь максимально полезным и точным
- Не пиши код и скрипты (вежливо откажи)
- Рандомное число — выдавай сразу одно, например: "77 🎲"`;

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
      temperature: 0.2,
      top_p: 0.85,
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
          temperature: 0.2,
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
