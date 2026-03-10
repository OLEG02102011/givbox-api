const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const weatherCache = { data: null, timestamp: 0, city: '' };
const rateLimits = new Map();

// ==================== ДАТА / ВРЕМЯ / ВЫЧИСЛЕНИЯ ====================
function getDateTimeInfo(timezone = 'Europe/Moscow') {
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(now);

  let year, month, day, hour, minute;
  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value);
    if (part.type === 'month') month = parseInt(part.value);
    if (part.type === 'day') day = parseInt(part.value);
    if (part.type === 'hour') hour = parseInt(part.value);
    if (part.type === 'minute') minute = parseInt(part.value);
  }

  const monthNamesIm = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ];

  const monthNamesRod = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const allMonthsDays = [];
  for (let m = 1; m <= 12; m++) {
    const d = new Date(year, m, 0).getDate();
    allMonthsDays.push({ name: monthNamesIm[m - 1], days: d });
  }

  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const daysLeftInMonth = daysInCurrentMonth - day;

  function daysBetween(y1, m1, d1, y2, m2, d2) {
    const a = new Date(y1, m1 - 1, d1);
    const b = new Date(y2, m2 - 1, d2);
    return Math.round((b - a) / 86400000);
  }

  const daysUntilMonths = [];
  for (let m = 1; m <= 12; m++) {
    let targetYear = year;
    let diff = daysBetween(year, month, day, targetYear, m, 1);
    if (diff <= 0) {
      targetYear = year + 1;
      diff = daysBetween(year, month, day, targetYear, m, 1);
    }
    daysUntilMonths.push({
      name: monthNamesRod[m - 1],
      nameIm: monthNamesIm[m - 1],
      month: m,
      days: diff,
      year: targetYear
    });
  }

  const seasons = [
    { name: 'весны', startMonth: 3, startDay: 1 },
    { name: 'лета', startMonth: 6, startDay: 1 },
    { name: 'осени', startMonth: 9, startDay: 1 },
    { name: 'зимы', startMonth: 12, startDay: 1 }
  ];

  const daysUntilSeasons = [];
  for (const s of seasons) {
    let targetYear = year;
    let diff = daysBetween(year, month, day, targetYear, s.startMonth, s.startDay);
    if (diff <= 0) {
      targetYear = year + 1;
      diff = daysBetween(year, month, day, targetYear, s.startMonth, s.startDay);
    }
    daysUntilSeasons.push({
      name: s.name,
      days: diff,
      year: targetYear
    });
  }

  let currentSeason;
  if (month >= 3 && month <= 5) currentSeason = 'весна';
  else if (month >= 6 && month <= 8) currentSeason = 'лето';
  else if (month >= 9 && month <= 11) currentSeason = 'осень';
  else currentSeason = 'зима';

  const daysUntilNewYear = daysBetween(year, month, day, year + 1, 1, 1);

  const startOfYear = new Date(year, 0, 1);
  const todayDate = new Date(year, month - 1, day);
  const dayOfYear = Math.round((todayDate - startOfYear) / 86400000) + 1;
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDaysInYear = isLeapYear ? 366 : 365;
  const daysLeftInYear = totalDaysInYear - dayOfYear;

  let timeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = 'утро';
  else if (hour >= 12 && hour < 17) timeOfDay = 'день';
  else if (hour >= 17 && hour < 22) timeOfDay = 'вечер';
  else timeOfDay = 'ночь';

  return {
    dateFormatted: dateFormatter.format(now),
    timeFormatted: timeFormatter.format(now),
    year, month, day, hour, minute,
    timeOfDay, currentSeason, isLeapYear,
    currentMonthName: monthNamesIm[month - 1],
    currentMonthNameRod: monthNamesRod[month - 1],
    daysInCurrentMonth, daysLeftInMonth, allMonthsDays,
    daysUntilMonths, daysUntilSeasons, daysUntilNewYear,
    dayOfYear, totalDaysInYear, daysLeftInYear, timezone
  };
}

// ==================== ПОГОДА ====================
async function getWeather(city = 'Moscow') {
  const now = Date.now();
  if (weatherCache.data && weatherCache.city === city && (now - weatherCache.timestamp) < 1800000) {
    return weatherCache.data;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1&lang=ru`,
      { headers: { 'User-Agent': 'curl/7.0' }, signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current_condition[0];
    const cityRuMap = {
      'Moscow': 'Москва', 'Saint Petersburg': 'Санкт-Петербург',
      'Novosibirsk': 'Новосибирск', 'Yekaterinburg': 'Екатеринбург', 'Kazan': 'Казань'
    };
    const weather = {
      temp: current.temp_C,
      feelsLike: current.FeelsLikeC,
      description: (current.lang_ru && current.lang_ru[0]) ? current.lang_ru[0].value : current.weatherDesc[0].value,
      humidity: current.humidity,
      windSpeed: current.windspeedKmph,
      city: cityRuMap[city] || city
    };
    weatherCache.data = weather;
    weatherCache.city = city;
    weatherCache.timestamp = now;
    return weather;
  } catch (e) { return null; }
}

// ==================== СКЛОНЕНИЕ "ДНЕЙ" ====================
function daysWord(n) {
  const abs = Math.abs(n);
  const last2 = abs % 100;
  const last1 = abs % 10;
  if (last2 >= 11 && last2 <= 19) return 'дней';
  if (last1 === 1) return 'день';
  if (last1 >= 2 && last1 <= 4) return 'дня';
  return 'дней';
}

// ==================== ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЧИСЕЛ (ИСПРАВЛЕНО) ====================

function generateRandomNumber(rawMin, rawMax) {
  // ВСЁ через let — чтобы можно было менять местами
  let min = Math.ceil(rawMin);
  let max = Math.floor(rawMax);

  // Автоматический своп если перепутали порядок
  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  // Если одинаковые — возвращаем как есть
  if (min === max) return min;

  // Проверка что диапазон не слишком огромный для Math.random
  // Number.MAX_SAFE_INTEGER = 9007199254740991
  const range = max - min;
  if (range > Number.MAX_SAFE_INTEGER) {
    // Для гигантских диапазонов — разбиваем на части
    // Генерируем дробную позицию [0, 1) и масштабируем
    const randomFraction = Math.random();
    const result = min + Math.floor(randomFraction * (max - min + 1));
    // Гарантируем что результат в границах
    return Math.max(min, Math.min(max, result));
  }

  const result = Math.floor(Math.random() * (range + 1)) + min;
  // Финальная гарантия — число ТОЧНО в границах
  return Math.max(min, Math.min(max, result));
}

function detectRandomNumberRequest(messages) {
  // Ищем ТОЛЬКО последнее сообщение пользователя
  let lastUserMessage = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const role = m.role || 'user';
    if (role === 'user') {
      lastUserMessage = m;
      break;
    }
  }

  if (!lastUserMessage) return null;

  const text = String(lastUserMessage.content || lastUserMessage.text || '');
  const lower = text.toLowerCase().trim();

  // Ключевые слова запроса на рандом
  const hasRandomKeyword = /рандом|случайн|random|назови\s*(мне\s*)?(число|цифр)|выбери\s*(мне\s*)?(число|цифр)|загадай|сгенерир|придумай\s*(мне\s*)?(число|цифр)|pick\s*a?\s*number|choose\s*a?\s*number|generate\s*a?\s*number|скажи\s*(мне\s*)?(число|цифр)|кинь\s*(кости|кубик)|брось\s*(кубик|кости)|рандомн/i.test(lower);

  if (!hasRandomKeyword) return null;

  // Паттерны для извлечения диапазона
  const rangePatterns = [
    /от\s+(-?\d+)\s*до\s+(-?\d+)/,
    /между\s+(-?\d+)\s*и\s+(-?\d+)/,
    /from\s+(-?\d+)\s*to\s+(-?\d+)/i,
    /between\s+(-?\d+)\s*and\s+(-?\d+)/i,
    /в\s+диапазоне\s+(-?\d+)\s*[-–—]\s*(-?\d+)/,
    /в\s+пределах\s+(-?\d+)\s*[-–—]\s*(-?\d+)/,
    /(-?\d+)\s*[-–—]\s*(-?\d+)/
  ];

  for (const pattern of rangePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const a = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      if (!isNaN(a) && !isNaN(b)) {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        const generated = generateRandomNumber(min, max);
        return { min, max, generated };
      }
    }
  }

  // Только «до X»
  const upToMatch = lower.match(/до\s+(\d+)/);
  if (upToMatch) {
    const max = parseInt(upToMatch[1], 10);
    if (!isNaN(max)) {
      const generated = generateRandomNumber(1, max);
      return { min: 1, max, generated };
    }
  }

  // Только «от X»
  const fromMatch = lower.match(/от\s+(\d+)/);
  if (fromMatch) {
    const min = parseInt(fromMatch[1], 10);
    if (!isNaN(min)) {
      const generated = generateRandomNumber(min, 100);
      return { min, max: 100, generated };
    }
  }

  // Ключевые слова есть, но цифр нет — дефолт 1–100
  const generated = generateRandomNumber(1, 100);
  return { min: 1, max: 100, generated };
}

// ==================== СИСТЕМНЫЙ ПРОМПТ ====================

const DEFAULT_SYSTEM_PROMPT_TEMPLATE = `Ты — GIV BOX AI. Очень умный, полезный, мужской (не женский!) и внимательный помощник.

Если вдруг спросят, кто тебя создал или кто тебя создала (и другие похожие слова) то ответь то что меня создали группа игр GIV BOX

САМОЕ ГЛАВНОЕ:
1. НИКОГДА не придумывай факты и не выдумывай определения несуществующих слов.
2. Всегда пытайся понять, что человек имел в виду (особенно если слово похоже на другое по написанию или звучанию).
3. Если очевидно опечатка — отвечай так, будто написали правильно, и используй правильное слово.
4. Пиши строго всегда смайлики для украшения, смайлики делают сообщения более дружелюбными и приятными. Пример правильно: "Привет! Как могу помочь тебе сегодня? 😁" Пример неправильно: "Привет! Как могу помочь тебе сегодня?"

Примеры правильного поведения:
— "расскажи эргедиент блинов" → отвечай про ингредиенты блинов
— "рецепт блинчиков с кефиром" → сразу дай рецепт
— "как делать фотосинтиз" → объясни фотосинтез
— "что такое квантовая механика" → объясни понятно и точно

Если всё-таки не уверен — лучше спроси уточнение, чем выдумывай.

=== ТЕКУЩАЯ ДАТА И ВРЕМЯ ===
{{DATETIME_BLOCK}}

=== ПОГОДА ===
{{WEATHER_BLOCK}}

=== КАЛЕНДАРЬ: ДНИ В МЕСЯЦАХ ({{YEAR}} год) ===
{{MONTHS_BLOCK}}

=== ПРЕДВЫЧИСЛЕННЫЕ РАССТОЯНИЯ В ДНЯХ ===
{{DISTANCES_BLOCK}}

=== СЕЗОНЫ ===
{{SEASONS_BLOCK}}

=== ГОД ===
{{YEAR_BLOCK}}

КРИТИЧЕСКИ ВАЖНО О ДАТАХ:
- Сейчас {{YEAR}} год. НЕ ДРУГОЙ.
- Все числа выше ТОЧНО ВЫЧИСЛЕНЫ компьютером. ИСПОЛЬЗУЙ ИХ КАК ЕСТЬ.
- НИКОГДА не считай дни самостоятельно — бери ГОТОВЫЕ числа из блока «ПРЕДВЫЧИСЛЕННЫЕ РАССТОЯНИЯ».
- Если спрашивают «сколько дней до лета» — найди строку «До лета» выше и скажи число оттуда.
- Если спрашивают «сколько дней в мае» — найди строку «Май» в календаре выше.
- НЕ ОКРУГЛЯЙ, НЕ ИСПРАВЛЯЙ эти числа. Они точные.

=== СЛУЧАЙНЫЕ ЧИСЛА ===
Ты УМЕЕШЬ генерировать случайные числа. Когда пользователь просит — тебе будет дано готовое число в блоке ниже. Просто красиво выведи его.

=== ФОРМАТИРОВАНИЕ ТЕКСТА ===

Ты поддерживаешь следующие маркеры форматирования. Каждый маркер ОБЯЗАТЕЛЬНО должен быть ОТКРЫТ и ЗАКРЫТ:

ЖИРНЫЙ: **текст** (два символа ** с обеих сторон)
КУРСИВ: *текст* (один символ * с обеих сторон)
ЗАЧЁРКНУТЫЙ: ~~текст~~ (два символа ~ с обеих сторон)
ВЫДЕЛЕНИЕ: ==текст== (два символа = с обеих сторон)
ЗАГОЛОВОК: # Текст (решётка и пробел в начале строки)
ЦИТАТА: > Текст (знак > и пробел в начале строки)

ПРИМЕРЫ ПРАВИЛЬНОГО ИСПОЛЬЗОВАНИЯ:

Пример 1:
**Характеристики телефона:**
- Экран: *6.7 дюймов AMOLED*
- Цена: ~~45000 руб~~ ==39990 руб==

Пример 2:
Столица Австралии — ~~Сидней~~ **Канберра**

Пример 3:
==Фотосинтез== — это процесс, при котором растения преобразуют *солнечный свет* в энергию.

КРИТИЧЕСКИЕ ПРАВИЛА ФОРМАТИРОВАНИЯ:
1. Каждый маркер ДОЛЖЕН быть закрыт: **вот так** а НЕ **вот так
2. НЕ вкладывай маркеры друг в друга
3. Зачёркнутый — ИМЕННО ~~две тильды~~, НЕ звёздочки
4. Используй форматирование уместно — не перегружай текст
5. Списки оформляй через - или числа

=== ПРАВИЛО ПОВТОРЕНИЯ ===
Если сообщение начинается с "Скажи", "Напиши", "Повтори", "Say", "Write", "Repeat" и т.п. на любом языке — выведи ТОЛЬКО текст после этого слова. Без кавычек, без пояснений. БЕЗ форматирования.

=== ЯЗЫК ===
Отвечай строго на языке последнего сообщения пользователя.

=== ПРОЧЕЕ ===
- Будь максимально полезным и точным
- Никогда не пиши код и скрипты, даже если пользователь просит — вежливо откажи`;

// ==================== СБОРКА ПРОМПТА ====================
async function buildSystemPrompt(customPrompt, options = {}) {
  const { city = 'Moscow', timezone = 'Europe/Moscow' } = options;

  const dt = getDateTimeInfo(timezone);
  const weather = await getWeather(city);

  const datetimeBlock = [
    `Сегодня: ${dt.dateFormatted}`,
    `Точная дата: ${dt.day} ${dt.currentMonthNameRod} ${dt.year} года`,
    `Текущий год: ${dt.year}`,
    `Время: ${dt.timeFormatted} (${dt.timeOfDay})`,
    `Часовой пояс: ${dt.timezone}`,
    `Текущий сезон: ${dt.currentSeason}`,
    `В текущем месяце (${dt.currentMonthName}): ${dt.daysInCurrentMonth} ${daysWord(dt.daysInCurrentMonth)}`,
    `Сегодня ${dt.day}-й день месяца, осталось ${dt.daysLeftInMonth} ${daysWord(dt.daysLeftInMonth)} до конца ${dt.currentMonthNameRod}`
  ].join('\n');

  let weatherBlock;
  if (weather) {
    weatherBlock = [
      `Город: ${weather.city}`,
      `Температура: ${weather.temp}°C (ощущается как ${weather.feelsLike}°C)`,
      `Погода: ${weather.description}`,
      `Влажность: ${weather.humidity}%`,
      `Ветер: ${weather.windSpeed} км/ч`
    ].join('\n');
  } else {
    weatherBlock = 'Данные о погоде временно недоступны. Если спросят — скажи что не удалось получить данные.';
  }

  const monthsBlock = dt.allMonthsDays
    .map(m => `- ${m.name.charAt(0).toUpperCase() + m.name.slice(1)} ${dt.year}: ${m.days} ${daysWord(m.days)}`)
    .join('\n');

  const distanceLines = [];
  distanceLines.push(`Сегодня: ${dt.day} ${dt.currentMonthNameRod} ${dt.year}`);
  distanceLines.push('');
  distanceLines.push('Дней до начала каждого месяца (от сегодня):');
  for (const m of dt.daysUntilMonths) {
    distanceLines.push(`- До 1 ${m.name} ${m.year}: ${m.days} ${daysWord(m.days)}`);
  }
  distanceLines.push('');
  distanceLines.push('Дней до сезонов (от сегодня):');
  for (const s of dt.daysUntilSeasons) {
    distanceLines.push(`- До ${s.name} (${s.year}): ${s.days} ${daysWord(s.days)}`);
  }
  distanceLines.push('');
  distanceLines.push(`До конца текущего месяца (${dt.currentMonthName}): ${dt.daysLeftInMonth} ${daysWord(dt.daysLeftInMonth)}`);
  distanceLines.push(`До Нового ${dt.year + 1} года: ${dt.daysUntilNewYear} ${daysWord(dt.daysUntilNewYear)}`);
  const distancesBlock = distanceLines.join('\n');

  const seasonsBlock = [
    `Сейчас: ${dt.currentSeason} ${dt.year}`,
    `Весна: март, апрель, май`,
    `Лето: июнь, июль, август`,
    `Осень: сентябрь, октябрь, ноябрь`,
    `Зима: декабрь, январь, февраль`
  ].join('\n');

  const yearBlock = [
    `Текущий год: ${dt.year}`,
    `Високосный: ${dt.isLeapYear ? 'да' : 'нет'}`,
    `Всего дней в ${dt.year} году: ${dt.totalDaysInYear}`,
    `Сегодня ${dt.dayOfYear}-й день года`,
    `Осталось дней в году: ${dt.daysLeftInYear}`
  ].join('\n');

  const basePrompt = customPrompt || DEFAULT_SYSTEM_PROMPT_TEMPLATE;

  return basePrompt
    .replace('{{DATETIME_BLOCK}}', datetimeBlock)
    .replace('{{WEATHER_BLOCK}}', weatherBlock)
    .replace('{{MONTHS_BLOCK}}', monthsBlock)
    .replace('{{DISTANCES_BLOCK}}', distancesBlock)
    .replace('{{SEASONS_BLOCK}}', seasonsBlock)
    .replace('{{YEAR_BLOCK}}', yearBlock)
    .replace(/\{\{YEAR\}\}/g, String(dt.year));
}

// ==================== RATE LIMIT ====================
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

// ==================== ВЫЗОВ AI ====================
async function callAI(apiKey, userMessages, systemPrompt, options = {}) {
  try {
    // ====== ДЕТЕКТ РАНДОМА — ВСЕГДА ЗАНОВО ПО ПОСЛЕДНЕМУ СООБЩЕНИЮ ======
    let randomResult = null;
    try {
      randomResult = detectRandomNumberRequest(userMessages);
    } catch (e) {
      // Если детект сломался — просто пропускаем, не ломаем весь ответ
      randomResult = null;
    }

    const dynamicPrompt = await buildSystemPrompt(systemPrompt, {
      city: options.city || 'Moscow',
      timezone: options.timezone || 'Europe/Moscow'
    });

    let finalPrompt = dynamicPrompt;

    // Если обнаружен запрос на рандом — вставляем блок с ГОТОВЫМ числом
    if (randomResult) {
      finalPrompt += '\n\n=== ГОТОВОЕ СЛУЧАЙНОЕ ЧИСЛО ===\n' +
        'Пользователь попросил случайное число.\n' +
        'Диапазон: от ' + randomResult.min + ' до ' + randomResult.max + '\n' +
        'Результат генерации: ' + randomResult.generated + '\n' +
        'Твой ответ ДОЛЖЕН содержать ИМЕННО число ' + randomResult.generated + '\n' +
        'Ответь коротко и красиво, например:\n' +
        '- "' + randomResult.generated + ' 🎲"\n' +
        '- "Выпало **' + randomResult.generated + '**! 🎲"\n' +
        '- "Ваше число: **' + randomResult.generated + '** 🎲"\n' +
        'НЕ МЕНЯЙ это число. НЕ ПРИДУМЫВАЙ другое. Используй ТОЛЬКО ' + randomResult.generated;
    }

    const messages = [];
    messages.push({ role: 'system', content: String(finalPrompt) });

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
          if (errData.estimated_time) waitTime = Math.ceil(errData.estimated_time);
        } catch (e) {}
        return { error: true, message: 'Модель загружается, подождите ~' + waitTime + ' сек', retryAfter: waitTime };
      }
      return { error: true, message: 'Ошибка провайдера (' + res.status + ')', detail: responseText.substring(0, 500) };
    }

    let data;
    try { data = JSON.parse(responseText); } catch (e) {
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

    // === ПРОВЕРКА: если модель всё равно проигнорировала число — подставляем принудительно ===
    if (randomResult) {
      const numStr = String(randomResult.generated);
      if (!content.includes(numStr)) {
        content = 'Выпало **' + numStr + '**! 🎲\n(Диапазон: от ' + randomResult.min + ' до ' + randomResult.max + ')';
      }
    }

    let finishReason = data.choices && data.choices[0] && data.choices[0].finish_reason;
    let attempts = 0;

    while (finishReason === 'length' && attempts < 3) {
      attempts++;
      const continueMessages = [...messages];
      continueMessages.push({ role: 'assistant', content: content });
      continueMessages.push({ role: 'user', content: 'Ответ обрезался. Продолжи ТОЧНО с места обрыва. НЕ повторяй написанное.' });

      const contRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: continueMessages, max_tokens: 8192, temperature: 0.2, top_p: 0.9, stream: false })
      });

      if (!contRes.ok) break;
      let contData;
      try { contData = JSON.parse(await contRes.text()); } catch (e) { break; }

      const contContent = contData.choices && contData.choices[0] && contData.choices[0].message && contData.choices[0].message.content;
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
  DEFAULT_SYSTEM_PROMPT_TEMPLATE,
  MODEL,
  checkRate,
  recordRate,
  getCorsHeaders,
  callAI,
  buildSystemPrompt,
  getDateTimeInfo,
  getWeather,
  generateRandomNumber,
  detectRandomNumberRequest
};
