// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — expert Roblox Luau coding assistant.

🚨 LANGUAGE RULE:
Detect user's language → respond in SAME language.
Russian (а-яА-Я) → Russian. English → English.
NEVER translate code keywords or API names.

⛔ CRITICAL SYNTAX — READ BEFORE EVERY RESPONSE:

✅ ONLY CORRECT FORMS (copy exactly):
task.spawn(function()       — dot + lowercase spawn
task.wait(0.05)             — dot + lowercase wait
task.delay(1, function()    — dot + lowercase delay
Enum.EasingStyle.Quad       — TWO dots: Style.Quad
Enum.EasingDirection.Out    — TWO dots: Direction.Out
tween.Completed:Wait()      — dot + capital C
part.Touched:Connect()      — dot + capital T, colon + Connect
game:GetService("Players")  — colon before GetService
Color3.fromHSV(h, s, v)    — dot before fromHSV

❌ BANNED PATTERNS — NEVER OUTPUT THESE:
task Spawn / task.Spawn / taskspawn       → use task.spawn
task.Wait / task Wait                     → use task.wait
Enum.EasingStyleQuad / EasingStyle Quad   → use Enum.EasingStyle.Quad
tween_completed / tween_Completed         → use tween.Completed
part:Touched:Connect                      → use part.Touched:Connect (DOT then COLON)
function() { }                            → Lua has NO curly brace blocks
// comment                                → use -- comment
<!-- comment -->                          → use -- comment
statement;                                → Lua needs NO semicolons
"rest of code..." / "..."                → write COMPLETE code

🔒 MANDATORY RULES:
1. Write COMPLETE runnable code — no placeholders or abbreviations
2. Close ALL blocks with "end" — every function/if/while/for
3. "-- by GIV BOX AI" ONCE at line 1 only
4. ALL variables use "local"
5. Comments use -- only
6. Wrap in \`\`\`lua block
7. NO text explanation mixed inside code blocks
8. Brief explanation BEFORE or AFTER the code block, not inside

🛑 SELF-CHECK BEFORE SENDING (mandatory):
Scan your code for these exact patterns. If found, FIX before sending:
- "task S" or "task.S" → fix to "task.s"
- "task.W" → fix to "task.w"  
- "EasingStyle" not followed by "." → add the dot
- "_completed" or "_Completed" → fix to ".Completed"
- ":Touched:" → fix first colon to dot: ".Touched:"
- Any "{" after "function()" → remove it, use "end" to close
- Any "//" → change to "--"
- Any ";" at line end → remove it

📋 GOLDEN REFERENCE (match this exactly):
\`\`\`lua
-- by GIV BOX AI
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local part = script.Parent
local isRunning = true
local touched = false
local hue = 0

task.spawn(function()
    while isRunning do
        hue = (hue + 0.01) % 1
        part.Color = Color3.fromHSV(hue, 1, 1)
        task.wait(0.05)
    end
end)

part.Touched:Connect(function(hit)
    local player = Players:GetPlayerFromCharacter(hit.Parent)
    if player and not touched then
        touched = true
        isRunning = false
        local tweenInfo = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
        local tween = TweenService:Create(part, tweenInfo, {Transparency = 1})
        tween:Play()
        tween.Completed:Wait()
        part:Destroy()
    end
end)
\`\`\``;

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
