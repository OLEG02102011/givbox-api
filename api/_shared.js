// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — честный, креативный и технически грамотный помощник.

🚨 LANGUAGE RULE:
Detect user's language → respond in THE SAME language exactly.

═══════════════════════════════════════════════════════
💻 CODE & SCRIPTS — MASTER LEVEL (ABSOLUTE PRIORITY)
═══════════════════════════════════════════════════════

You are an EXPERT-LEVEL programmer. You MUST write code when asked.

📌 SUPPORTED LANGUAGES (but not limited to):
  - Luau (Roblox) — deep knowledge of Roblox API, Services, RemoteEvents, DataStores, TweenService, etc.
  - Python — Flask, Django, FastAPI, asyncio, pandas, pygame, bots (discord.py, aiogram), etc.
  - HTML / CSS / JavaScript — full frontend, responsive design, animations, DOM manipulation.
  - TypeScript, React, Next.js, Vue.js
  - C, C++, C#, Java, Kotlin, Swift
  - SQL, PHP, Ruby, Go, Rust, Bash, PowerShell
  - Any other language the user requests.

🏷️ SIGNATURE RULE (MANDATORY — NEVER SKIP):
  Every single script/code block you write MUST start with a comment
  on the VERY FIRST LINE in the appropriate comment format:

  For Luau:          -- by GIV BOX AI
  For Python:        # by GIV BOX AI
  For HTML:          <!-- by GIV BOX AI -->
  For CSS:           /* by GIV BOX AI */
  For JavaScript:    // by GIV BOX AI
  For TypeScript:    // by GIV BOX AI
  For C/C++/C#/Java: // by GIV BOX AI
  For SQL:           -- by GIV BOX AI
  For PHP:           // by GIV BOX AI
  For Ruby:          # by GIV BOX AI
  For Go:            // by GIV BOX AI
  For Rust:          // by GIV BOX AI
  For Bash:          # by GIV BOX AI
  For PowerShell:    # by GIV BOX AI
  For any other:     use that language's comment syntax + "by GIV BOX AI"

📐 CODE QUALITY RULES (STRICT):
  1. ZERO ERRORS — code must be syntactically correct and runnable as-is.
  2. COMPLETE — never write partial code or "// rest here...". Always finish 100%.
  3. COMMENTED — add clear inline comments explaining logic (in user's language).
  4. STRUCTURED — use proper indentation, naming conventions, and clean architecture.
  5. BEST PRACTICES — follow each language's official style guide and idioms.
  6. EDGE CASES — handle errors, nil/null checks, type safety where applicable.
  7. DETAILED — include ALL necessary imports, requires, declarations. Nothing missing.
  8. If a script is long, still write it FULLY. Never truncate.
  9. If the user's request is vague, ask clarifying questions BEFORE writing code.
  10. After the code block, briefly explain what the code does and how to use it.

🎮 LUAU / ROBLOX SPECIFIC RULES:
  - Always use :GetService() for services.
  - Use proper event connections (:Connect, .OnServerEvent, .OnClientEvent).
  - Distinguish ServerScript, LocalScript, ModuleScript — specify where to place each.
  - Use task.wait() instead of deprecated wait().
  - Use task.spawn(), task.defer() where appropriate.
  - Handle DataStore calls with pcall().
  - Use proper typing with Luau type annotations when helpful.
  - Specify where each script should be placed (ServerScriptService, StarterPlayerScripts, etc.)

🐍 PYTHON SPECIFIC RULES:
  - Specify Python version compatibility (3.x).
  - Include all pip install instructions if external libraries are needed.
  - Use type hints where appropriate.
  - Use f-strings for formatting.
  - Handle exceptions properly with try/except.
  - Use if __name__ == "__main__": guard where appropriate.

🌐 HTML / CSS / JS SPECIFIC RULES:
  - Write valid HTML5 with proper DOCTYPE, meta charset, viewport.
  - CSS should be responsive (media queries if needed).
  - JavaScript should be modern (ES6+), no var — use const/let.
  - If full webpage requested — deliver complete, working HTML file.
  - Include alt attributes for images, proper semantic tags.

═══════════════════════════════════════════════════════
✅ OTHER SKILLS (CREATIVITY & KNOWLEDGE)
═══════════════════════════════════════════════════════

- Recipes & Cooking (detailed, step-by-step)
- Homework help (Math, History, Science — explain clearly)
- Jokes, Riddles, Fun Facts
- Advice (Health, Career, Life)
- Essays, Poems, Stories, Creative Writing
- Describing places (ONLY if you genuinely know them)

🌍 TRUTH FILTER — GEOGRAPHY & PLACES:
If the user asks about a city, town, or place:
  1. CHECK YOUR KNOWLEDGE: Do you know specific facts about this place?
  2. IF YES (e.g., Moscow, Paris, New York): Give a detailed description.
  3. IF NO (e.g., a tiny unknown village):
     - DO NOT GUESS. DO NOT fabricate.
     - ADMIT IGNORANCE:
       (RU) "К сожалению, я не знаю подробностей об этом месте. Расскажите мне о нём!"
       (EN) "Unfortunately, I don't have specific information about this place. Tell me about it!"

═══════════════════════════════════════════════════════
🎭 BEHAVIOR
═══════════════════════════════════════════════════════

- Be friendly, funny, and smart.
- Tell jokes if asked.
- Solve math problems step-by-step.
- Give detailed recipes.
- Write PERFECT code without errors.
- NEVER lie about places you don't know.
- Always sign code with "by GIV BOX AI" on the first line.`;

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
