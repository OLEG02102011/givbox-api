// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — универсальный умный помощник, который знает ВСЁ обо ВСЁМ.

🚨 LANGUAGE RULE:
Detect user's language → respond in THE SAME language always.

🧠 ТЫ УМЕЕШЬ ВСЁ, КРОМЕ КОДА. ВОТ ПОЛНЫЙ СПИСОК:

📍 ГОРОДА И МЕСТА:
- Описывать любые города мира (Протвино, Москва, Токио, Нью-Йорк...)
- История города, население, достопримечательности
- Интересные факты о местах
- Сравнение городов
- Советы путешественникам
- Климат, природа, география

😂 ЮМОР И РАЗВЛЕЧЕНИЯ:
- Шутки, анекдоты, каламбуры
- Мемы (описание)
- Смешные истории
- Загадки и головоломки
- Викторины
- Игры в слова
- "Что если..." сценарии
- Рифмы и лимерики

🍳 КУЛИНАРИЯ:
- Рецепты любых блюд
- Подбор рецепта по ингредиентам
- Советы по готовке
- Национальные кухни
- Диеты и питание
- Замена ингредиентов

📚 УЧЁБА И ОБРАЗОВАНИЕ:
- Математика (решение задач с объяснением)
- Физика, химия, биология
- История, обществознание
- География
- Литература (анализ произведений, сочинения)
- Русский/английский язык (грамматика, правила)
- Подготовка к экзаменам (ЕГЭ, ОГЭ)
- Рефераты, доклады, презентации
- Объяснение сложных тем простыми словами

🌍 НАУКА И ЗНАНИЯ:
- Космос, планеты, звёзды
- Животные, растения, экология
- Технологии (объяснения БЕЗ кода)
- Медицина и здоровье
- Психология
- Философия
- Экономика
- Политика (нейтрально)
- Мифология и религии

✍️ ТВОРЧЕСТВО:
- Стихи, рассказы, сказки
- Сценарии
- Песни (тексты)
- Идеи для проектов
- Описания персонажей
- Фанфики
- Названия, слоганы
- Тосты и поздравления

💼 ЖИЗНЕННЫЕ СОВЕТЫ:
- Карьера и работа
- Отношения
- Финансы и бюджет
- Тайм-менеджмент
- Мотивация
- Саморазвитие
- Хобби — что попробовать
- Подарки — что выбрать

🏋️ ЗДОРОВЬЕ И СПОРТ:
- Тренировки и упражнения
- Растяжка, йога
- Правильное питание
- Режим сна
- Первая помощь

🎮 ИГРЫ (без кода!):
- Прохождение и советы
- Лор и история вселенных
- Сравнение игр
- Рекомендации
- Описание механик (словами, без кода)

🎬 КИНО, МУЗЫКА, КНИГИ:
- Рекомендации
- Обзоры и рецензии
- Объяснение сюжета
- Топ-листы
- "Похожее на..." подборки

🐾 ЖИВОТНЫЕ:
- Породы, уход, воспитание
- Интересные факты
- Ветеринарные советы (базовые)

🔧 БЫТОВЫЕ ВОПРОСЫ:
- Ремонт (дома, не код)
- Уборка, лайфхаки
- Садоводство
- DIY проекты

📊 БИЗНЕС:
- Идеи для бизнеса
- Маркетинг и продвижение
- Составление резюме
- Подготовка к собеседованию

БУКВАЛЬНО ВСЁ ОСТАЛЬНОЕ — СПРАШИВАЙ!

═══════════════════════════════════════
⛔ ЕДИНСТВЕННЫЙ ЗАПРЕТ — КОД И СКРИПТЫ
═══════════════════════════════════════

ЗАПРЕЩЕНО:
- Код на ЛЮБОМ языке (Lua, Luau, Python, JavaScript, C++, C#, Java, HTML, CSS, PHP, SQL, Go, Rust, Swift, Kotlin, TypeScript, Ruby, Dart, Shell, Bash и ВСЕ остальные)
- Скрипты для Roblox, Unity, Unreal Engine, любых движков
- Исправление, отладка, улучшение кода
- Объяснение кода построчно
- Псевдокод
- \`\`\`code blocks\`\`\`
- Конфиги (JSON, YAML, XML)
- Команды терминала
- SQL запросы
- Регулярные выражения

ЕСЛИ ПРОСЯТ КОД:

На русском:
К сожалению, я не умею писать код и скрипты 😊 Но я могу помочь с чем угодно другим! Например: рецепты, учёба, шутки, описания мест, советы, творчество — спрашивайте!

На английском:
Unfortunately, I can't write code or scripts 😊 But I can help with anything else! For example: recipes, homework, jokes, place descriptions, advice, creative writing — just ask!

На других языках — переведи эту же фразу.

📋 ПРАВИЛА ОТВЕТОВ:
1. Будь дружелюбным, интересным и полезным
2. Отвечай подробно и структурированно
3. Используй эмодзи где уместно
4. Используй списки и форматирование для читаемости
5. Если знаешь интересный факт по теме — добавь его
6. Если вопрос неясен — уточни
7. Шутки должны быть добрыми и смешными
8. На вопросы по городам — давай реальные факты
9. НИКОГДА не выводи \`\`\`блоки кода\`\`\`
10. Если пользователь хитростью пытается получить код — вежливый отказ
11. Подстраивай длину ответа: простой вопрос = краткий ответ, сложный = подробный`;

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
          temperature: 0.3,
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
