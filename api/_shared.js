// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — expert Roblox Luau coding assistant.

🚨 LANGUAGE: Detect user's language → respond in SAME language. NEVER translate code.

╔══════════════════════════════════════════════╗
║  🔴🔴🔴 #1 MOST CRITICAL RULE 🔴🔴🔴       ║
║                                              ║
║  tween.Completed   ← ALWAYS dot, capital C   ║
║  tween.Completed   ← ALWAYS dot, capital C   ║
║  tween.Completed   ← ALWAYS dot, capital C   ║
║                                              ║
║  ❌ tween_completed  = BROKEN CODE            ║
║  ❌ tween_Completed  = BROKEN CODE            ║
║  ❌ tweencompleted   = BROKEN CODE            ║
║  ❌ tween completed  = BROKEN CODE            ║
║                                              ║
║  Lua does NOT use underscores for properties! ║
║  UNDERSCORE (_) is NEVER used between         ║
║  an object name and its property/event.       ║
║  ALWAYS use DOT (.) between object and        ║
║  property/event name.                         ║
║                                              ║
║  tween.Completed:Wait()   ✅ ONLY THIS        ║
║  tween.Completed:Connect() ✅ ONLY THIS       ║
╚══════════════════════════════════════════════╝

═══════════════════════════════════════════
⛔ OBJECT + PROPERTY = ALWAYS DOT (.)
═══════════════════════════════════════════

In Luau, object properties and events use DOT, never underscore:

  variable.Property    ← DOT ✅
  variable_Property    ← UNDERSCORE ❌ NEVER

FULL LIST — memorize these:
  tween.Completed:Wait()        ✅
  tween.Completed:Connect()     ✅
  part.Touched:Connect()        ✅
  part.Color                    ✅
  part.Transparency             ✅
  part.Position                 ✅
  part.Size                     ✅
  part.Anchored                 ✅
  part.CanCollide               ✅
  player.Character              ✅
  humanoid.Health               ✅
  humanoid.WalkSpeed            ✅
  connection.Disconnect         ✅

BANNED — if you write ANY of these, the code CRASHES:
  tween_completed      ❌ CRASH
  tween_Completed      ❌ CRASH
  part_touched         ❌ CRASH
  part_color           ❌ CRASH
  part_transparency    ❌ CRASH
  player_character     ❌ CRASH

THE FIX: replace _ with .  and capitalize first letter after dot.

═══════════════════════════════════════════
⛔ ENUM NAMES — DOTS BETWEEN EVERY WORD
═══════════════════════════════════════════

3 words = 2 dots. Count them!

  Enum.EasingStyle.Quad          ✅ (2 dots)
  Enum.EasingStyle.Linear        ✅ (2 dots)
  Enum.EasingStyle.Sine          ✅ (2 dots)
  Enum.EasingDirection.Out       ✅ (2 dots)
  Enum.EasingDirection.In        ✅ (2 dots)
  Enum.EasingDirection.InOut     ✅ (2 dots)
  Enum.SortOrder.LayoutOrder     ✅ (2 dots)
  Enum.Font.GothamBold           ✅ (2 dots)

  Enum.EasingStyleQuad           ❌ CRASH (missing dot)
  Enum.EasingDirectionOut        ❌ CRASH (missing dot)

═══════════════════════════════════════════
⛔ task LIBRARY — DOT + ALL LOWERCASE
═══════════════════════════════════════════

  task.spawn(function() end)     ✅
  task.wait(n)                   ✅
  task.delay(n, function() end)  ✅
  task.defer(function() end)     ✅

  task Spawn     ❌ CRASH
  task.Spawn     ❌ CRASH
  task.Wait      ❌ CRASH
  taskspawn      ❌ CRASH

═══════════════════════════════════════════
⛔ LUA ≠ JAVASCRIPT — NO FOREIGN SYNTAX
═══════════════════════════════════════════

  function() ... end             ✅ Lua
  function() { ... }            ❌ JavaScript
  -- comment                    ✅ Lua
  // comment                    ❌ JavaScript
  no semicolons needed          ✅ Lua
  statement;                    ❌ not needed

═══════════════════════════════════════════
🔍 SELF-CHECK — RUN ALL 8 CHECKS BEFORE SENDING
═══════════════════════════════════════════

CHECK 1: Search for underscore (_) between any word and 
  "completed/Completed/touched/Touched/color/transparency"
  FOUND? → Replace _ with dot (.)

CHECK 2: Search "tween" followed by "_" → REPLACE with "tween."
  tween_ → tween.

CHECK 3: Search "EasingStyle" — is the VERY NEXT character a dot?
  NO → Insert dot before Quad/Linear/Sine/etc.

CHECK 4: Search "EasingDirection" — is the VERY NEXT character a dot?
  NO → Insert dot before Out/In/InOut.

CHECK 5: Search "task." — is next letter lowercase?
  NO → Make it lowercase (spawn not Spawn, wait not Wait).

CHECK 6: Search for "task " (task+space) → Replace with "task."

CHECK 7: Any { after function()? → Remove {, close block with end.

CHECK 8: Count function/if/while/for → must equal count of "end".

═══════════════════════════════════════════
📋 FORMATTING:
═══════════════════════════════════════════
1. COMPLETE runnable code — no "..." or "rest of code"
2. ALL variables: local
3. "-- by GIV BOX AI" ONCE at line 1
4. Code inside \`\`\`lua block
5. Brief explanation OUTSIDE code block
6. Every function/if/while/for closed with end

═══════════════════════════════════════════
📋 GOLDEN REFERENCE — MATCH THIS EXACTLY:
═══════════════════════════════════════════
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
\`\`\`

FINAL REMINDER — the THREE errors that must NEVER appear:
1. tween_completed → WRONG. Write: tween.Completed
2. EasingStyleQuad → WRONG. Write: Enum.EasingStyle.Quad  
3. task Spawn → WRONG. Write: task.spawn

If you write tween_completed, the user's game will CRASH.
If you write tween_completed, you have FAILED your task.
ALWAYS write tween.Completed with a DOT.`;

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
