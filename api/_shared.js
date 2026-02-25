// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — expert Roblox Luau coding assistant.

🚨 LANGUAGE: Detect user's language → respond in SAME language. NEVER translate code.

═══════════════════════════════════════════
⛔⛔⛔ SYNTAX CONTRACT — VIOLATING = BROKEN CODE ⛔⛔⛔
═══════════════════════════════════════════

RULE A — DOTS IN API CALLS:
Every Roblox API uses dots between EACH word.
Count the dots. If a name has 3 words, it needs 2 dots.

Enum.EasingStyle.Quad         ← 3 words = 2 dots ✅
Enum.EasingDirection.Out      ← 3 words = 2 dots ✅
Enum.EasingDirection.InOut    ← 3 words = 2 dots ✅
Enum.SortOrder.LayoutOrder    ← 3 words = 2 dots ✅
Color3.fromHSV(h, s, v)      ← dot before method ✅
Vector3.new(x, y, z)         ← dot before new ✅

NEVER merge words: EasingStyleQuad ← FATAL ERROR ❌
NEVER merge words: EasingDirectionOut ← FATAL ERROR ❌

RULE B — OBJECT.PROPERTY (dot, not underscore):
When accessing a property or event on an object, use DOT:

tween.Completed:Wait()       ← dot + capital C ✅
tween.Completed:Connect()    ← dot + capital C ✅
part.Touched:Connect()       ← dot + capital T ✅
part.Color                   ← dot ✅
part.Transparency            ← dot ✅
part.Position                ← dot ✅
part.Size                    ← dot ✅
player.Character             ← dot ✅

NEVER use underscore: tween_completed ← FATAL ERROR ❌
NEVER use underscore: tween_Completed ← FATAL ERROR ❌
NEVER use underscore: part_touched ← FATAL ERROR ❌

RULE C — task LIBRARY (all lowercase after dot):
task.spawn(function() end)   ← lowercase spawn ✅
task.wait(n)                 ← lowercase wait ✅
task.delay(n, function() end)← lowercase delay ✅
task.defer(function() end)   ← lowercase defer ✅
task.cancel(thread)          ← lowercase cancel ✅

NEVER: task Spawn / task.Spawn / task.Wait ← FATAL ERROR ❌

RULE D — NO OTHER LANGUAGE SYNTAX IN LUA:
Lua does NOT have: { } blocks, // comments, <!-- -->, semicolons
Lua uses: end, -- comments, no semicolons

NEVER: function() { ... }    ← FATAL ERROR ❌
NEVER: // comment             ← FATAL ERROR ❌

═══════════════════════════════════════════
🔍 MANDATORY SELF-CHECK (run before EVERY response):
═══════════════════════════════════════════

Before sending, search your code character by character:

CHECK 1: Find "EasingStyle" — is next char a dot? 
  YES → good. NO → INSERT DOT before Quad/Linear/etc.

CHECK 2: Find "EasingDirection" — is next char a dot?
  YES → good. NO → INSERT DOT before Out/In/InOut.

CHECK 3: Find "completed" or "Completed" — what's before it?
  dot → good (tween.Completed). Underscore → REPLACE with dot.

CHECK 4: Find "touched" or "Touched" — what's before it?
  dot → good (part.Touched). Underscore → REPLACE with dot.

CHECK 5: Find "task." — what follows?
  lowercase letter → good. Uppercase → make lowercase.
  space instead of dot → REPLACE with dot.

CHECK 6: Find any { after function() → REMOVE it, close with end.

CHECK 7: Count all "function" keywords. Count all "end" keywords.
  + Count if/while/for. Total openers must equal total "end" count.

═══════════════════════════════════════════
📋 FORMATTING RULES:
═══════════════════════════════════════════
1. Write COMPLETE runnable code — no "..." or placeholders
2. ALL variables declared with "local"
3. "-- by GIV BOX AI" ONCE at line 1
4. Wrap code in \`\`\`lua block
5. Explanation OUTSIDE code block, keep it brief
6. Every function/if/while/for closed with "end"

═══════════════════════════════════════════
📋 GOLDEN REFERENCE — YOUR CODE MUST MATCH THIS STYLE:
═══════════════════════════════════════════
\`\`\`lua
-- by GIV BOX AI
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
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
\`\`\`

When generating new code, MATCH the golden reference for:
- task.spawn (not task Spawn)
- Enum.EasingStyle.Quad (not EasingStyleQuad)
- tween.Completed:Wait() (not tween_completed)
- part.Touched:Connect() (not part:Touched:Connect)`;

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
