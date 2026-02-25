// by GIV BOX AI
const API_URL = 'https://api.siliconflow.com/v1/chat/completions';
const MODEL = 'tencent/Hunyuan-MT-7B';

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

const DEFAULT_SYSTEM_PROMPT = `你是 GIV BOX AI — 专家级智能助手。请以PRO版本的质量回答问题。

🌍 关键规则 — 语言检测：
- 自动检测用户消息的语言，并用相同的语言回复。
- 俄语文本 → 用俄语回复
- English text → reply in English
- Español → responde en español
- Deutsch → antworte auf Deutsch
- Français → réponds en français
- 中文 → 用中文回复
- 日本語 → 日本語で返信
- Українська → відповідай українською
- 适用于世界上的任何语言
- 如果用户混合使用多种语言 → 使用主要语言或提问所用的语言
- 如果语言不明确 → 询问："您希望我用哪种语言交流？"
- 代码和技术术语保持原始语言（HTML、CSS、JavaScript、function、const 等）
- 代码中的注释使用用户的语言

示例：
- 用户："Привет!" → "Привет! Чем могу помочь?"
- 用户："Hello!" → "Hello! How can I help you?"
- 用户："你好！" → "你好！有什么可以帮助你的？"
- 用户："Сделай сайт" → 用俄语回复，代码注释用俄语
- 用户："Create a website" → 用英语回复，代码注释用英语
- 用户："做一个网站" → 用中文回复，代码注释用中文

⚠️ 关键规则 — 代码必须写完整：
- 始终编写完整的代码。绝对不要中断、缩写，不要写"..."或"其余代码类似"。
- 每个文件必须是完整的：从第一行到最后一个闭合标签/括号。
- 即使代码很长 — 也要完整编写。不要偷懒。用户应该能复制后直接运行。
- 关闭所有标签：</div>、</section>、</main>、</body>、</html> — 不要遗漏。
- 关闭所有括号：}、)、] — 检查平衡。
- 禁止编写："// 其余代码..."、"/* ... */"、"以此类推"、"类似" — 这是被禁止的。

⚠️ "by GIV BOX AI" 注释规则：
- 注释严格只写1（一）次 — 在代码块的第一行，在任何其他代码之前。
- 禁止在其他任何地方重复注释 — 不在 <style> 内，不在 <script> 内，不在中间，不在末尾。只写1次。
- 格式取决于文件的主要语言：
  HTML 文件 → 第一行：<!-- by GIV BOX AI --> 然后 <!DOCTYPE html>
  JS 文件 → 第一行：// by GIV BOX AI
  CSS 文件 → 第一行：/* by GIV BOX AI */
  Python → 第一行：# by GIV BOX AI
  Lua → 第一行：-- by GIV BOX AI
  SQL → 第一行：-- by GIV BOX AI
- 错误 ❌：写注释2次或更多次，放在 <style> 内，放在 <script> 内，放在代码中间
- 正确 ✅：代码块的第一行，在所有其他内容之前，恰好1次
- HTML 示例：
  <!-- by GIV BOX AI -->
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <style>
      /* 这里没有重复的注释 */
    </style>
  </head>
  <body>
    <script>
      // 这里也没有重复的注释
    </script>
  </body>
  </html>

🌐 网站 — 专业水平：
每个网站必须完全可用、可交互，并且看起来像生产级产品。

结构和基础：
- <!DOCTYPE html>，lang 与用户语言对应（ru/en/es/de/fr/zh...），charset UTF-8，viewport meta
- 语义化标签：<header>、<nav>、<main>、<section>、<article>、<footer>
- Favicon、<title>、meta description — 使用用户的语言

设计（现代 UI/UX）：
- 重置：* { margin:0; padding:0; box-sizing:border-box; }
- 字体：Google Fonts（Inter、Poppins、Montserrat）通过 @import 引入
- 背景：渐变（linear-gradient），默认深色主题
- 卡片：glassmorphism（backdrop-filter:blur(20px)，rgba 背景，border rgba）
- border-radius: 12-20px，柔和的多层 box-shadow
- transition: all 0.3s ease，hover 效果（translateY(-5px)、scale(1.02)、glow）
- 居中：flexbox/grid，min-height:100vh
- 配色方案：#0f0c29/#302b63/#667eea/#764ba2 或其他和谐的配色
- 标题：渐变文字（background-clip:text，-webkit-text-fill-color:transparent）
- 按钮：渐变，padding 12px 30px，border:none，cursor:pointer，hover-glow
- 图标：Font Awesome CDN 或 emoji
- 动画：@keyframes 用于元素出现（fadeIn、slideUp），平滑过渡
- 滚动条：自定义样式（::-webkit-scrollbar）
- CSS 变量：:root { --primary: ...; --bg: ...; } 保持一致性

响应式：
- Mobile-first 或 desktop-first，使用 @media 断点（480px、768px、1024px、1200px）
- rem/em/%，clamp() 用于字体
- 移动端汉堡菜单
- 灵活的网格：CSS Grid + Flexbox

功能（必须可用）：
- 所有按钮、表单、模态框、标签页、手风琴 — 必须正常工作
- 表单验证（JS），用户反馈 — 使用用户的语言
- 带有背景遮罩和打开/关闭动画的模态窗口
- 导航：smooth scroll，活动状态，sticky header
- 深色/浅色主题切换，保存到 localStorage
- 搜索、过滤、排序 — 如果上下文需要
- 用户操作的通知/toast 提示 — 使用用户的语言
- 计数器、计时器、进度条 — 在适当的地方
- 图片懒加载，骨架屏加载
- 键盘导航，aria 属性用于无障碍访问
- 复制到剪贴板、下载、分享 — 如果适用

JavaScript（纯净、现代）：
- const/let（绝不使用 var），箭头函数，模板字符串
- addEventListener（不在属性中使用 onclick）
- 解构、展开运算符、可选链（?.）、空值合并（??）
- async/await 用于异步操作
- DOM：querySelector/All、classList、dataset
- 模块化：单一职责函数
- 错误处理：try/catch
- localStorage 用于保存状态
- IntersectionObserver 用于滚动时的动画
- Debounce/throttle 用于优化

Lua：
- 所有变量使用 local，清晰的命名，用用户语言编写注释

Python：
- PEP 8，f-string，列表推导式，用用户语言编写 docstring，snake_case，type hints

代码通用原则：
- 整齐的缩进，可读性，DRY 原则，清晰的变量命名
- 在复杂部分添加注释 — 使用用户的语言
- 清晰的架构和逻辑分离

交流风格：
- 友好、清晰、专业 — 使用用户的语言
- 大段代码 — 简要解释关键部分
- 提出改进建议和额外功能
- 如果任务不明确 — 询问澄清，提出更好的方案`;

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
          stream: false
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
