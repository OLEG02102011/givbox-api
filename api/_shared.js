// by GIV BOX AI — Enhanced Code Engine v2.1 (FIXED)

const API_URL = 'https://api.siliconflow.com/v1/chat/completions';

// === МУЛЬТИМОДЕЛЬНАЯ СИСТЕМА (ИСПРАВЛЕНО) ===
const MODELS = {
  chat: 'tencent/Hunyuan-MT-7B',
  code: 'tencent/Hunyuan-MT-7B',       // ДОБАВЛЕНО — было undefined
  analysis: 'tencent/Hunyuan-MT-7B',   // ДОБАВЛЕНО — было undefined
  fallback: 'tencent/Hunyuan-MT-7B'    // ДОБАВЛЕНО — было undefined
};

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

// === ОПРЕДЕЛЕНИЕ ЯЗЫКА ПРОГРАММИРОВАНИЯ ===
const LANGUAGE_PATTERNS = {
  luau: {
    keywords: ['roblox', 'luau', 'rbx', 'studio', 'localscript', 'serverscript',
               'modulescript', 'remoteEvent', 'datastore', 'workspace', 'getservice',
               'tweenservice', 'userinputservice', 'players', 'replicatedstorage',
               'serverstorage', 'startergui', 'starterpack', 'starterplayer',
               'bindableEvent', 'humanoid', 'character', 'leaderstats', 'tool',
               'part', 'model', 'gui', 'frame', 'textlabel', 'textbutton',
               'screengui', 'billboardgui', 'surfacegui', 'proximity prompt',
               'touched', 'raycast', 'weld', 'motor6d', 'animation', 'sound'],
    comment: '-- by GIV BOX AI',
    extension: '.lua'
  },
  python: {
    keywords: ['python', 'pip', 'django', 'flask', 'fastapi', 'pandas',
               'numpy', 'pytorch', 'tensorflow', 'selenium', 'beautifulsoup',
               'requests', 'asyncio', 'discord.py', 'aiogram', 'pygame',
               'tkinter', 'matplotlib', 'opencv', 'pillow', 'sqlalchemy',
               'celery', 'scrapy', 'pytest', 'bot telegram', 'бот дискорд',
               'бот телеграм', 'парсер', 'парсинг', 'скрапинг'],
    comment: '# by GIV BOX AI',
    extension: '.py'
  },
  javascript: {
    keywords: ['javascript', 'js', 'node', 'nodejs', 'express', 'react',
               'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'electron',
               'discord.js', 'jquery', 'webpack', 'vite', 'npm', 'yarn',
               'fetch', 'axios', 'socket.io', 'three.js', 'p5.js',
               'canvas', 'dom', 'event listener', 'promise', 'async await'],
    comment: '// by GIV BOX AI',
    extension: '.js'
  },
  typescript: {
    keywords: ['typescript', 'ts', 'tsx', 'interface', 'type annotation',
               'generic', 'enum', 'namespace', 'decorator'],
    comment: '// by GIV BOX AI',
    extension: '.ts'
  },
  html: {
    keywords: ['html', 'webpage', 'website', 'страниц', 'сайт', 'лендинг',
               'landing', 'форма', 'form', 'div', 'css', 'bootstrap',
               'tailwind', 'responsive', 'адаптив'],
    comment: '<!-- by GIV BOX AI -->',
    extension: '.html'
  },
  css: {
    keywords: ['css', 'стили', 'стиль', 'анимация css', 'flexbox', 'grid',
               'media query', 'sass', 'scss', 'less', 'tailwind'],
    comment: '/* by GIV BOX AI */',
    extension: '.css'
  },
  csharp: {
    keywords: ['c#', 'csharp', 'unity', 'asp.net', '.net', 'xamarin',
               'wpf', 'winforms', 'blazor', 'entity framework', 'linq'],
    comment: '// by GIV BOX AI',
    extension: '.cs'
  },
  cpp: {
    keywords: ['c++', 'cpp', 'unreal', 'qt', 'opengl', 'vulkan',
               'directx', 'cmake', 'pointer', 'template', 'stl'],
    comment: '// by GIV BOX AI',
    extension: '.cpp'
  },
  c: {
    keywords: ['язык c', 'c language', 'malloc', 'stdio', 'stdlib',
               'embedded', 'microcontroller', 'arduino'],
    comment: '// by GIV BOX AI',
    extension: '.c'
  },
  java: {
    keywords: ['java', 'spring', 'springboot', 'maven', 'gradle',
               'android', 'swing', 'javafx', 'hibernate', 'jdbc',
               'servlet', 'jsp', 'jpa', 'kotlin'],
    comment: '// by GIV BOX AI',
    extension: '.java'
  },
  kotlin: {
    keywords: ['kotlin', 'android kotlin', 'ktor', 'coroutine',
               'jetpack compose', 'compose'],
    comment: '// by GIV BOX AI',
    extension: '.kt'
  },
  swift: {
    keywords: ['swift', 'swiftui', 'uikit', 'ios', 'xcode',
               'cocoapods', 'spm', 'core data'],
    comment: '// by GIV BOX AI',
    extension: '.swift'
  },
  rust: {
    keywords: ['rust', 'cargo', 'tokio', 'actix', 'wasm',
               'ownership', 'borrowing', 'lifetime'],
    comment: '// by GIV BOX AI',
    extension: '.rs'
  },
  go: {
    keywords: ['golang', 'go lang', 'goroutine', 'gin', 'fiber',
               'go module', 'channel'],
    comment: '// by GIV BOX AI',
    extension: '.go'
  },
  php: {
    keywords: ['php', 'laravel', 'symfony', 'wordpress', 'composer',
               'eloquent', 'blade', 'artisan'],
    comment: '// by GIV BOX AI',
    extension: '.php'
  },
  ruby: {
    keywords: ['ruby', 'rails', 'sinatra', 'gem', 'bundler',
               'rake', 'erb', 'rspec'],
    comment: '# by GIV BOX AI',
    extension: '.rb'
  },
  sql: {
    keywords: ['sql', 'mysql', 'postgresql', 'sqlite', 'mongodb',
               'database', 'query', 'таблица', 'select', 'insert',
               'join', 'index', 'stored procedure', 'trigger'],
    comment: '-- by GIV BOX AI',
    extension: '.sql'
  },
  bash: {
    keywords: ['bash', 'shell', 'linux', 'terminal', 'command line',
               'скрипт bash', 'sh', 'zsh', 'sed', 'awk', 'grep'],
    comment: '# by GIV BOX AI',
    extension: '.sh'
  },
  powershell: {
    keywords: ['powershell', 'ps1', 'cmdlet', 'windows script',
               'active directory', 'get-process'],
    comment: '# by GIV BOX AI',
    extension: '.ps1'
  },
  dart: {
    keywords: ['dart', 'flutter', 'widget', 'material design'],
    comment: '// by GIV BOX AI',
    extension: '.dart'
  },
  r: {
    keywords: ['r language', 'rstudio', 'ggplot', 'tidyverse',
               'dplyr', 'shiny', 'cran'],
    comment: '# by GIV BOX AI',
    extension: '.r'
  },
  matlab: {
    keywords: ['matlab', 'simulink', 'octave', 'matrix'],
    comment: '% by GIV BOX AI',
    extension: '.m'
  },
  scala: {
    keywords: ['scala', 'akka', 'spark', 'play framework', 'sbt'],
    comment: '// by GIV BOX AI',
    extension: '.scala'
  },
  perl: {
    keywords: ['perl', 'cpan', 'regex perl'],
    comment: '# by GIV BOX AI',
    extension: '.pl'
  },
  haskell: {
    keywords: ['haskell', 'monad', 'ghc', 'cabal', 'stack'],
    comment: '-- by GIV BOX AI',
    extension: '.hs'
  },
  elixir: {
    keywords: ['elixir', 'phoenix', 'erlang', 'otp', 'genserver'],
    comment: '# by GIV BOX AI',
    extension: '.ex'
  },
  vue: {
    keywords: ['vue', 'vuex', 'pinia', 'vue router', 'composition api',
               'options api', 'vue 3', 'nuxt'],
    comment: '<!-- by GIV BOX AI -->',
    extension: '.vue'
  },
  assembly: {
    keywords: ['assembly', 'asm', 'nasm', 'masm', 'x86', 'arm assembly'],
    comment: '; by GIV BOX AI',
    extension: '.asm'
  },
  solidity: {
    keywords: ['solidity', 'smart contract', 'ethereum', 'web3',
               'blockchain', 'nft contract', 'erc20', 'erc721'],
    comment: '// by GIV BOX AI',
    extension: '.sol'
  },
  yaml: {
    keywords: ['yaml', 'yml', 'docker-compose', 'kubernetes', 'k8s',
               'github actions', 'ci/cd'],
    comment: '# by GIV BOX AI',
    extension: '.yml'
  },
  dockerfile: {
    keywords: ['dockerfile', 'docker', 'container', 'image'],
    comment: '# by GIV BOX AI',
    extension: 'Dockerfile'
  }
};

// === УМНОЕ ОПРЕДЕЛЕНИЕ ТИПА ЗАДАЧИ ===
const CODE_TRIGGER_WORDS = [
  'напиши', 'создай', 'сделай', 'код', 'скрипт', 'программ', 'функци',
  'класс', 'модуль', 'api', 'бот', 'парсер', 'сервер', 'клиент',
  'приложение', 'игр', 'сайт', 'страниц', 'виджет', 'компонент',
  'алгоритм', 'сортировк', 'поиск', 'база данных', 'запрос',
  'write', 'create', 'make', 'code', 'script', 'program', 'function',
  'class', 'module', 'bot', 'parser', 'server', 'client', 'app',
  'game', 'website', 'page', 'widget', 'component', 'algorithm',
  'sort', 'search', 'database', 'query', 'implement', 'build',
  'develop', 'debug', 'fix', 'refactor', 'optimize', 'исправь',
  'рефактор', 'оптимизир', 'отладь', 'почему не работает',
  'ошибка в коде', 'error', 'bug', 'не компилируется', 'exception',
  'help with code', 'помоги с кодом', 'review', 'ревью',
  'покажи пример', 'example', 'snippet', 'template', 'boilerplate',
  'architecture', 'архитектур', 'pattern', 'паттерн', 'design pattern',
  'unit test', 'тест', 'testing', 'deploy', 'деплой', 'ci cd',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp'
];

const ANALYSIS_TRIGGER_WORDS = [
  'объясни', 'explain', 'как работает', 'how does', 'what does',
  'разбери', 'analyze', 'анализ', 'review', 'ревью', 'почему',
  'why does', 'что делает', 'what is', 'что такое', 'зачем',
  'расскажи про', 'tell me about', 'разница между', 'difference',
  'сравни', 'compare', 'плюсы и минусы', 'pros and cons',
  'best practice', 'лучшие практики', 'когда использовать',
  'when to use', 'как выбрать', 'how to choose'
];

function detectTaskType(text) {
  const lower = text.toLowerCase();
  const hasCodeBlock = text.includes('```') || text.includes('`');

  let codeScore = 0;
  let analysisScore = 0;

  for (const word of CODE_TRIGGER_WORDS) {
    if (lower.includes(word)) codeScore++;
  }

  for (const word of ANALYSIS_TRIGGER_WORDS) {
    if (lower.includes(word)) analysisScore++;
  }

  if (hasCodeBlock && analysisScore > 0) return 'analysis';
  if (codeScore >= 2) return 'code';

  if (codeScore >= 1) {
    for (const [lang, data] of Object.entries(LANGUAGE_PATTERNS)) {
      for (const kw of data.keywords) {
        if (lower.includes(kw)) return 'code';
      }
    }
  }

  if (analysisScore >= 1 && hasCodeBlock) return 'analysis';
  return 'chat';
}

function detectLanguages(text) {
  const lower = text.toLowerCase();
  const detected = [];

  for (const [lang, data] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;
    for (const kw of data.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > 0) {
      detected.push({ lang, score, data });
    }
  }

  detected.sort((a, b) => b.score - a.score);
  return detected;
}

// === СИСТЕМНЫЙ ПРОМПТ ===
const DEFAULT_SYSTEM_PROMPT = `You are GIV BOX AI — мощный ИИ-программист и помощник экспертного уровня.

🚨 LANGUAGE RULE:
Определи язык пользователя → отвечай на ТОМ ЖЕ языке.

═══════════════════════════════════════════════════════
💻 CODE ENGINE — УРОВЕНЬ SENIOR DEVELOPER
═══════════════════════════════════════════════════════

Ты — ЭКСПЕРТНЫЙ программист мирового уровня с глубоким знанием ВСЕХ языков программирования,
фреймворков, библиотек и архитектурных паттернов.

📌 ТВОИ ЗНАНИЯ ПОКРЫВАЮТ (но НЕ ограничиваются):

🎮 GAME DEVELOPMENT:
  - Luau/Roblox: ВСЕ сервисы, API, паттерны, оптимизация, античит
  - Unity/C#: MonoBehaviour, ScriptableObjects, ECS, шейдеры, UI
  - Unreal/C++: Blueprints, Actor lifecycle, Networking, Materials
  - Godot/GDScript: Node system, signals, scenes
  - Pygame, Love2D, Phaser.js, Three.js

🌐 WEB DEVELOPMENT:
  Frontend: HTML5, CSS3, JavaScript ES2024, TypeScript, React, Vue 3,
            Angular, Svelte, Next.js, Nuxt 3, Astro, Solid.js,
            Tailwind CSS, Bootstrap 5, Material UI, Chakra UI
  Backend:  Node.js, Express, Fastify, NestJS, Deno, Bun,
            Python (Django, Flask, FastAPI),
            PHP (Laravel, Symfony), Ruby on Rails,
            Java (Spring Boot), Kotlin (Ktor),
            Go (Gin, Fiber), Rust (Actix, Axum),
            C# (ASP.NET Core), Elixir (Phoenix)
  Database: PostgreSQL, MySQL, MongoDB, Redis, SQLite,
            Prisma, Sequelize, TypeORM, Drizzle,
            Firebase, Supabase

📱 MOBILE:
  - React Native, Flutter/Dart, Swift/SwiftUI, Kotlin/Jetpack Compose

🤖 AI / ML / DATA:
  - Python: PyTorch, TensorFlow, scikit-learn, Keras, Hugging Face
  - Data: pandas, numpy, matplotlib, seaborn, plotly

🔧 DEVOPS / INFRA:
  - Docker, Kubernetes, Terraform, Ansible
  - CI/CD: GitHub Actions, GitLab CI, Jenkins
  - AWS, Azure, GCP, Vercel, Netlify

═══════════════════════════════════════════════════════
🏷️ ПОДПИСЬ — ОБЯЗАТЕЛЬНО
═══════════════════════════════════════════════════════

КАЖДЫЙ блок кода ОБЯЗАН начинаться с комментария "by GIV BOX AI"
в формате комментария данного языка.

═══════════════════════════════════════════════════════
📐 СТАНДАРТЫ КАЧЕСТВА КОДА
═══════════════════════════════════════════════════════

1. ✅ НОЛЬ ОШИБОК — код синтаксически идеальный и запускаемый
2. ✅ 100% ПОЛНЫЙ — НИКОГДА не пиши "// остальное здесь..."
3. ✅ КОММЕНТАРИИ — понятные inline-комментарии
4. ✅ BEST PRACTICES — официальные стайл-гайды
5. ✅ EDGE CASES — обработка ошибок
6. ✅ ВСЕ ИМПОРТЫ — ни один import не пропущен

═══════════════════════════════════════════════════════
🎭 ПОВЕДЕНИЕ
═══════════════════════════════════════════════════════

- Дружелюбный, умный
- Пиши ИДЕАЛЬНЫЙ код без ошибок
- НИКОГДА не обрезай код
- ВСЕГДА подписывай код "by GIV BOX AI"
- Если не знаешь — скажи честно`;

const CODE_BOOST_PROMPT = `
ADDITIONAL CODE INSTRUCTIONS:
- You are now in CODE MODE. Focus 100% on writing perfect, production-ready code.
- Think step by step before writing.
- Consider edge cases, error handling, and performance.
`;

const ANALYSIS_BOOST_PROMPT = `
ADDITIONAL ANALYSIS INSTRUCTIONS:
- You are now in CODE ANALYSIS MODE.
- Be thorough and precise in your analysis.
- Categorize issues: 🔴 Critical, 🟡 Warning, 🔵 Suggestion
`;

const DEBUG_BOOST_PROMPT = `
ADDITIONAL DEBUG INSTRUCTIONS:
- You are now in DEBUG MODE.
- Carefully trace through the code logic.
- Identify the exact line(s) causing the issue.
`;

// === RATE LIMITING ===
const rateLimits = new Map();

function checkRate(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { requests: [], lastRequest: 0 });
  }
  const u = rateLimits.get(ip);

  if (u.lastRequest > 0 && (now - u.lastRequest) < 2000) {
    return { allowed: false, reason: 'Подождите пару секунд', retryAfter: 2 };
  }

  u.requests = u.requests.filter(t => t > now - 3600000);

  const perMin = u.requests.filter(t => t > now - 60000).length;
  const perHour = u.requests.length;

  if (perMin >= 12) return { allowed: false, reason: 'Макс 12 запросов/мин', retryAfter: 60 };
  if (perHour >= 120) return { allowed: false, reason: 'Лимит 120/час', retryAfter: 300 };

  return {
    allowed: true,
    remaining: { minute: 12 - perMin, hour: 120 - perHour }
  };
}

function recordRate(ip) {
  const u = rateLimits.get(ip);
  if (u) {
    u.requests.push(Date.now());
    u.lastRequest = Date.now();
  }
}

// === CORS ===
function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Fingerprint'
  };
}

// === УМНОЕ СЖАТИЕ ИСТОРИИ ===
function compressHistory(messages, maxTokenEstimate = 30000) {
  const charLimit = maxTokenEstimate * 4;

  let totalChars = 0;
  for (const m of messages) {
    totalChars += (m.content || '').length;
  }

  if (totalChars <= charLimit) return messages;

  const result = [];

  if (messages.length > 4) {
    result.push(messages[0]);
    result.push(messages[1]);
    result.push({
      role: 'system',
      content: '[...предыдущие сообщения сжаты для экономии контекста...]'
    });
  }

  const remaining = charLimit - result.reduce((s, m) => s + m.content.length, 0);
  let recentChars = 0;
  const recentMessages = [];

  for (let i = messages.length - 1; i >= Math.min(2, messages.length); i--) {
    const msgLen = (messages[i].content || '').length;
    if (recentChars + msgLen > remaining) break;
    recentChars += msgLen;
    recentMessages.unshift(messages[i]);
  }

  result.push(...recentMessages);
  return result;
}

// === ГЛАВНАЯ ФУНКЦИЯ AI (ИСПРАВЛЕНА) ===
async function callAI(apiKey, userMessages, systemPrompt, options = {}) {
  try {
    // === ВАЛИДАЦИЯ API КЛЮЧА ===
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      return {
        error: true,
        message: '🔑 API ключ не указан или пустой'
      };
    }

    // === ВАЛИДАЦИЯ СООБЩЕНИЙ ===
    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return {
        error: true,
        message: '❌ Нет сообщений для отправки'
      };
    }

    // Определяем тип задачи из последнего сообщения
    const lastUserMessage = [...userMessages]
      .reverse()
      .find(m => m.role === 'user' || !m.role);
    const lastText = lastUserMessage
      ? String(lastUserMessage.content || lastUserMessage.text || '')
      : '';

    if (!lastText || lastText.trim() === '') {
      return {
        error: true,
        message: '❌ Пустое сообщение'
      };
    }

    const taskType = detectTaskType(lastText);
    const detectedLangs = detectLanguages(lastText);

    // === ВЫБОР МОДЕЛИ (ИСПРАВЛЕНО — с проверкой) ===
    let selectedModel = MODELS.chat; // безопасный дефолт

    if (taskType === 'code' && MODELS.code) {
      selectedModel = MODELS.code;
    } else if (taskType === 'analysis' && MODELS.analysis) {
      selectedModel = MODELS.analysis;
    }

    // Переопределение из опций
    if (options.model && typeof options.model === 'string') {
      selectedModel = options.model;
    }

    // === ФИНАЛЬНАЯ ПРОВЕРКА МОДЕЛИ ===
    if (!selectedModel || typeof selectedModel !== 'string') {
      selectedModel = 'tencent/Hunyuan-MT-7B';
      console.warn('Model was undefined, using fallback:', selectedModel);
    }

    console.log(`[GIV BOX AI] Task: ${taskType}, Model: ${selectedModel}, Languages: ${detectedLangs.map(d => d.lang).join(', ') || 'none'}`);

    // Формируем системный промпт
    let finalSystemPrompt = String(systemPrompt || DEFAULT_SYSTEM_PROMPT);

    if (taskType === 'code') {
      finalSystemPrompt += '\n\n' + CODE_BOOST_PROMPT;
      if (detectedLangs.length > 0) {
        const langNames = detectedLangs.slice(0, 3).map(d => d.lang).join(', ');
        finalSystemPrompt += `\nDetected programming language(s): ${langNames}. Focus your expertise on these technologies.`;
      }
    } else if (taskType === 'analysis') {
      finalSystemPrompt += '\n\n' + ANALYSIS_BOOST_PROMPT;
    }

    const debugWords = ['debug', 'отладь', 'не работает', 'ошибка', 'error',
                        'bug', 'fix', 'исправь', 'crash', 'падает', 'broken'];
    if (debugWords.some(w => lastText.toLowerCase().includes(w))) {
      finalSystemPrompt += '\n\n' + DEBUG_BOOST_PROMPT;
    }

    // === СОБИРАЕМ СООБЩЕНИЯ ===
    const messages = [];
    messages.push({ role: 'system', content: finalSystemPrompt });

    const processedMessages = [];
    for (let i = 0; i < userMessages.length; i++) {
      const m = userMessages[i];
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      const text = String(m.content || m.text || '').slice(0, 20000);
      if (text.trim() !== '') {
        processedMessages.push({ role, content: text });
      }
    }

    if (processedMessages.length === 0) {
      return {
        error: true,
        message: '❌ Нет валидных сообщений после обработки'
      };
    }

    const compressed = compressHistory(processedMessages);
    messages.push(...compressed);

    // === ПАРАМЕТРЫ ГЕНЕРАЦИИ ===
    let temperature = 0.3;
    let maxTokens = 8192;
    let topP = 0.9;

    if (taskType === 'code') {
      temperature = 0.15;
      maxTokens = 8192;
      topP = 0.85;
    } else if (taskType === 'chat') {
      temperature = 0.6;
      maxTokens = 4096;
      topP = 0.95;
    }

    if (options.temperature !== undefined) temperature = options.temperature;
    if (options.maxTokens !== undefined) maxTokens = options.maxTokens;

    const requestBody = {
      model: selectedModel,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
      stream: false
    };

    console.log(`[GIV BOX AI] Sending request to ${API_URL}, model: ${requestBody.model}, messages: ${messages.length}`);

    // === ПЕРВЫЙ ЗАПРОС ===
    let res;
    let responseText;

    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      responseText = await res.text();
    } catch (fetchError) {
      console.error('[GIV BOX AI] Fetch error:', fetchError.message);
      return {
        error: true,
        message: '🌐 Ошибка сети: не удалось связаться с API провайдером. ' + fetchError.message
      };
    }

    console.log(`[GIV BOX AI] Response status: ${res.status}, length: ${responseText.length}`);

    // === ФОЛЛБЭК НА ДРУГУЮ МОДЕЛЬ ===
    if (!res.ok && (res.status === 503 || res.status === 500 || res.status === 404)) {
      console.log(`[GIV BOX AI] Model ${selectedModel} unavailable (${res.status}), trying fallback...`);

      // Список моделей для попытки
      const fallbackModels = [
        MODELS.fallback,
        MODELS.chat,
        'tencent/Hunyuan-MT-7B'
      ].filter(m => m && m !== selectedModel); // убираем дубли и текущую

      for (const fallbackModel of fallbackModels) {
        console.log(`[GIV BOX AI] Trying fallback model: ${fallbackModel}`);
        requestBody.model = fallbackModel;

        try {
          res = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          responseText = await res.text();

          if (res.ok) {
            console.log(`[GIV BOX AI] Fallback model ${fallbackModel} succeeded`);
            break;
          }
        } catch (e) {
          console.error(`[GIV BOX AI] Fallback fetch error:`, e.message);
          continue;
        }
      }
    }

    // === ОБРАБОТКА ОШИБОК ===
    if (!res.ok) {
      console.error(`[GIV BOX AI] API Error ${res.status}:`, responseText.substring(0, 500));

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
          message: `⏳ Модель загружается, подождите ~${waitTime} сек и повторите`,
          retryAfter: waitTime
        };
      }
      if (res.status === 429) {
        return {
          error: true,
          message: '⚠️ Слишком много запросов к API. Подождите минуту.',
          retryAfter: 60
        };
      }
      if (res.status === 401 || res.status === 403) {
        return {
          error: true,
          message: '🔑 Ошибка авторизации API. Проверьте ключ.',
          detail: responseText.substring(0, 300)
        };
      }
      if (res.status === 404) {
        return {
          error: true,
          message: `❌ Модель "${requestBody.model}" не найдена у провайдера. Проверьте название модели.`,
          detail: responseText.substring(0, 300)
        };
      }
      if (res.status === 400) {
        let errorDetail = responseText.substring(0, 500);
        try {
          const errObj = JSON.parse(responseText);
          errorDetail = errObj.error?.message || errObj.message || errorDetail;
        } catch (e) {}
        return {
          error: true,
          message: `❌ Неверный запрос (400): ${errorDetail}`
        };
      }
      return {
        error: true,
        message: `❌ Ошибка провайдера (${res.status})`,
        detail: responseText.substring(0, 500)
      };
    }

    // === ПАРСИНГ ОТВЕТА ===
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[GIV BOX AI] JSON parse error:', e.message, 'Response:', responseText.substring(0, 200));
      return {
        error: true,
        message: '❌ Ошибка парсинга ответа от API',
        detail: responseText.substring(0, 200)
      };
    }

    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    } else if (data.choices && data.choices[0] && data.choices[0].text) {
      content = data.choices[0].text;
    } else if (Array.isArray(data) && data[0] && data[0].generated_text) {
      content = data[0].generated_text;
    } else if (data.output) {
      content = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
    }

    if (!content || content.trim() === '') {
      console.error('[GIV BOX AI] Empty content. Full response:', JSON.stringify(data).substring(0, 500));
      return {
        error: true,
        message: '❌ Пустой ответ от модели. Попробуйте переформулировать запрос.',
        detail: JSON.stringify(data).substring(0, 300)
      };
    }

    // === АВТОПРОДОЛЖЕНИЕ ДЛЯ ДЛИННОГО КОДА ===
    let finishReason = data.choices && data.choices[0] && data.choices[0].finish_reason;
    let attempts = 0;
    const maxContinuations = 3;

    while (finishReason === 'length' && attempts < maxContinuations) {
      attempts++;
      console.log(`[GIV BOX AI] Auto-continue attempt ${attempts}/${maxContinuations}`);

      const hasOpenCodeBlock = (content.match(/```/g) || []).length % 2 !== 0;
      const lastLines = content.split('\n').slice(-5).join('\n');

      let continuePrompt = '';
      if (hasOpenCodeBlock) {
        continuePrompt = 'Код был обрезан. Продолжи ТОЧНО с места обрыва. ' +
          'НЕ начинай заново. НЕ повторяй написанное. ' +
          `Последние строки были:\n\`\`\`\n${lastLines}\n\`\`\``;
      } else {
        continuePrompt = 'Ответ был обрезан. Продолжи ТОЧНО с места обрыва.';
      }

      const continueMessages = [...messages];
      continueMessages.push({ role: 'assistant', content: content });
      continueMessages.push({ role: 'user', content: continuePrompt });

      try {
        const contRes = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: requestBody.model,
            messages: continueMessages,
            max_tokens: maxTokens,
            temperature: 0.15,
            top_p: 0.85,
            stream: false
          })
        });

        if (!contRes.ok) {
          console.log('[GIV BOX AI] Continue request failed:', contRes.status);
          break;
        }

        let contData;
        try {
          contData = JSON.parse(await contRes.text());
        } catch (e) {
          console.log('[GIV BOX AI] Continue parse error');
          break;
        }

        const contContent = contData.choices && contData.choices[0] &&
                             contData.choices[0].message && contData.choices[0].message.content;
        if (!contContent || contContent.trim() === '') break;

        const cleanCont = removeDuplicatePrefix(content, contContent);
        content += '\n' + cleanCont;

        finishReason = contData.choices[0].finish_reason;
      } catch (contError) {
        console.error('[GIV BOX AI] Continue error:', contError.message);
        break;
      }
    }

    // === ПОСТ-ОБРАБОТКА ===
    content = postProcessCode(content);

    return {
      success: true,
      content,
      meta: {
        model: requestBody.model,
        taskType,
        detectedLanguages: detectedLangs.map(d => d.lang),
        continuations: attempts,
        finishReason
      }
    };

  } catch (e) {
    console.error('[GIV BOX AI] Critical error:', e.message, e.stack);
    return {
      error: true,
      message: '❌ Внутренняя ошибка: ' + e.message
    };
  }
}

// === УДАЛЕНИЕ ДУБЛИРОВАНИЯ ПРИ СКЛЕЙКЕ ===
function removeDuplicatePrefix(existingContent, newContent) {
  const existingLines = existingContent.split('\n');
  const newLines = newContent.split('\n');

  const checkLines = Math.min(10, existingLines.length);
  for (let overlap = checkLines; overlap >= 3; overlap--) {
    const existingTail = existingLines.slice(-overlap).join('\n').trim();
    const newHead = newLines.slice(0, overlap).join('\n').trim();

    if (existingTail === newHead) {
      return newLines.slice(overlap).join('\n');
    }
  }

  return newContent;
}

// === ПОСТ-ОБРАБОТКА КОДА ===
function postProcessCode(content) {
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    content += '\n```';
  }

  content = content.replace(/\n{4,}/g, '\n\n\n');

  return content;
}

// === ЭКСПОРТ ===
module.exports = {
  ALLOWED_ORIGINS,
  DEFAULT_SYSTEM_PROMPT,
  MODELS,
  LANGUAGE_PATTERNS,
  checkRate,
  recordRate,
  getCorsHeaders,
  callAI,
  detectTaskType,
  detectLanguages,
  compressHistory,
  postProcessCode
};
