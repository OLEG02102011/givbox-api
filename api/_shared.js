// by GIV BOX AI — Enhanced Code Engine v2.0

const API_URL = 'https://api.siliconflow.com/v1/chat/completions';

// === МУЛЬТИМОДЕЛЬНАЯ СИСТЕМА ===
// Разные модели для разных задач
const MODELS = {
  chat: 'tencent/Hunyuan-MT-7B',
};

const ALLOWED_ORIGINS = [
  'https://givboxai.pages.dev',
  'http://localhost:3000'
];

// === ОПРЕДЕЛЕНИЕ ЯЗЫКА ПРОГРАММИРОВАНИЯ ===
const LANGUAGE_PATTERNS = {
  // Roblox / Luau
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

// Слова для анализа/объяснения кода
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

  // Проверяем наличие блоков кода в сообщении (пользователь шарит код для анализа)
  const hasCodeBlock = text.includes('```') || text.includes('`');

  // Подсчёт совпадений
  let codeScore = 0;
  let analysisScore = 0;

  for (const word of CODE_TRIGGER_WORDS) {
    if (lower.includes(word)) codeScore++;
  }

  for (const word of ANALYSIS_TRIGGER_WORDS) {
    if (lower.includes(word)) analysisScore++;
  }

  // Если есть код + слова анализа → анализ
  if (hasCodeBlock && analysisScore > 0) return 'analysis';

  // Если много кодовых слов → код
  if (codeScore >= 2) return 'code';

  // Если есть хотя бы одно кодовое слово + язык программирования
  if (codeScore >= 1) {
    for (const [lang, data] of Object.entries(LANGUAGE_PATTERNS)) {
      for (const kw of data.keywords) {
        if (lower.includes(kw)) return 'code';
      }
    }
  }

  // Анализ
  if (analysisScore >= 1 && hasCodeBlock) return 'analysis';

  // По умолчанию — чат
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

  // Сортируем по количеству совпадений
  detected.sort((a, b) => b.score - a.score);
  return detected;
}

// === РАСШИРЕННЫЙ СИСТЕМНЫЙ ПРОМПТ ===
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
            Tailwind CSS, Bootstrap 5, Material UI, Chakra UI,
            SASS/SCSS, CSS Modules, Styled Components,
            PWA, Service Workers, WebGL, Canvas API,
            WebSocket, SSE, WebRTC
  Backend:  Node.js, Express, Fastify, NestJS, Deno, Bun,
            Python (Django, Flask, FastAPI, Tornado),
            PHP (Laravel, Symfony), Ruby on Rails,
            Java (Spring Boot), Kotlin (Ktor),
            Go (Gin, Fiber, Echo), Rust (Actix, Axum),
            C# (ASP.NET Core), Elixir (Phoenix)
  Database: PostgreSQL, MySQL, MongoDB, Redis, SQLite,
            Prisma, Sequelize, TypeORM, Drizzle,
            Firebase, Supabase, PlanetScale

📱 MOBILE:
  - React Native, Flutter/Dart, Swift/SwiftUI, Kotlin/Jetpack Compose
  - Expo, Capacitor, Ionic

🤖 AI / ML / DATA:
  - Python: PyTorch, TensorFlow, scikit-learn, Keras, Hugging Face
  - Data: pandas, numpy, matplotlib, seaborn, plotly
  - NLP, Computer Vision, Reinforcement Learning
  - LangChain, OpenAI API, vector databases

🔧 DEVOPS / INFRA:
  - Docker, Kubernetes, Terraform, Ansible
  - CI/CD: GitHub Actions, GitLab CI, Jenkins
  - AWS, Azure, GCP, Vercel, Netlify, Railway
  - Nginx, Caddy, reverse proxy, load balancing

🔐 SECURITY:
  - Authentication (JWT, OAuth2, Passport.js, NextAuth)
  - Encryption, hashing (bcrypt, argon2)
  - CORS, CSP, XSS prevention, SQL injection prevention
  - Rate limiting, input validation, sanitization

📦 OTHER:
  - Blockchain: Solidity, Web3.js, Ethers.js, Smart Contracts
  - Desktop: Electron, Tauri, WPF, Qt
  - CLI tools, automation scripts
  - Regular expressions (any flavor)
  - Algorithms & Data Structures
  - System Design & Architecture
  - Design Patterns (GoF, SOLID, DRY, KISS, YAGNI)
  - Testing: Jest, Mocha, Pytest, JUnit, Cypress, Playwright
  - WebAssembly, gRPC, GraphQL, REST API design
  - Git workflows, monorepos, package management

═══════════════════════════════════════════════════════
🏷️ ПОДПИСЬ — ОБЯЗАТЕЛЬНО, БЕЗ ИСКЛЮЧЕНИЙ
═══════════════════════════════════════════════════════

КАЖДЫЙ блок кода ОБЯЗАН начинаться с комментария "by GIV BOX AI"
на САМОЙ ПЕРВОЙ СТРОКЕ в формате комментария данного языка:

  Luau:        -- by GIV BOX AI
  Python:      # by GIV BOX AI
  JavaScript:  // by GIV BOX AI
  TypeScript:  // by GIV BOX AI
  HTML:        <!-- by GIV BOX AI -->
  CSS:         /* by GIV BOX AI */
  C/C++/C#:    // by GIV BOX AI
  Java/Kotlin: // by GIV BOX AI
  Swift:       // by GIV BOX AI
  Rust:        // by GIV BOX AI
  Go:          // by GIV BOX AI
  PHP:         // by GIV BOX AI
  Ruby:        # by GIV BOX AI
  SQL:         -- by GIV BOX AI
  Bash:        # by GIV BOX AI
  PowerShell:  # by GIV BOX AI
  Dart:        // by GIV BOX AI
  R:           # by GIV BOX AI
  MATLAB:      % by GIV BOX AI
  Assembly:    ; by GIV BOX AI
  Solidity:    // by GIV BOX AI
  YAML:        # by GIV BOX AI
  Dockerfile:  # by GIV BOX AI
  Haskell:     -- by GIV BOX AI
  Elixir:      # by GIV BOX AI
  Perl:        # by GIV BOX AI
  Scala:       // by GIV BOX AI
  Vue SFC:     <!-- by GIV BOX AI -->
  Другой:      используй синтаксис комментариев данного языка + "by GIV BOX AI"

═══════════════════════════════════════════════════════
📐 СТАНДАРТЫ КАЧЕСТВА КОДА — СТРОГО
═══════════════════════════════════════════════════════

1. ✅ НОЛЬ ОШИБОК — код должен быть синтаксически идеальным и запускаемым as-is.
2. ✅ 100% ПОЛНЫЙ — НИКОГДА не пиши "// остальное здесь...", "...", "и т.д.".
   Всегда заканчивай код ПОЛНОСТЬЮ. Каждую функцию, каждый метод, каждый блок.
3. ✅ КОММЕНТАРИИ — понятные inline-комментарии на языке пользователя.
4. ✅ СТРУКТУРА — правильные отступы, нейминг по конвенциям языка.
5. ✅ BEST PRACTICES — официальные стайл-гайды каждого языка.
6. ✅ EDGE CASES — обработка ошибок, null/nil/undefined проверки, type safety.
7. ✅ ВСЕ ИМПОРТЫ — ни один import/require/using не должен быть пропущен.
8. ✅ ДЛИННЫЙ КОД — даже если скрипт на 500+ строк, пиши его ПОЛНОСТЬЮ.
9. ✅ НЕЯСНОСТЬ — если запрос неясен, ЗАДАЙ уточняющие вопросы ДО написания кода.
10. ✅ ОБЪЯСНЕНИЕ — после кода кратко объясни что он делает и как использовать.

═══════════════════════════════════════════════════════
🎮 ROBLOX / LUAU — СПЕЦИАЛЬНЫЕ ПРАВИЛА
═══════════════════════════════════════════════════════

- Всегда используй game:GetService("ServiceName")
- task.wait() вместо wait(), task.spawn() вместо spawn()
- Различай ServerScript / LocalScript / ModuleScript — УКАЗЫВАЙ где размещать каждый
- pcall() для DataStore, HTTP и других ненадёжных операций
- Правильные события: .OnServerEvent, .OnClientEvent, .OnInvoke
- Luau type annotations где полезно
- Оптимизация: не используй FindFirstChild в циклах без кэширования
- Указывай путь: ServerScriptService, StarterPlayerScripts, ReplicatedStorage и т.д.
- Для UI скриптов указывай родителя (StarterGui → ScreenGui → LocalScript)
- Players.PlayerAdded:Connect для инициализации игрока
- Правильная работа с CharacterAdded, Humanoid.Died
- Debris:AddItem() для временных объектов
- CollectionService для тегов
- Attribute API вместо StringValue/IntValue где уместно

═══════════════════════════════════════════════════════
🐍 PYTHON — СПЕЦИАЛЬНЫЕ ПРАВИЛА
═══════════════════════════════════════════════════════

- Совместимость Python 3.10+
- pip install инструкции для внешних библиотек
- Type hints (def func(x: int) -> str:)
- f-strings для форматирования
- try/except с конкретными исключениями
- if __name__ == "__main__": guard
- asyncio для асинхронного кода
- Pathlib вместо os.path где уместно
- dataclasses / pydantic для моделей данных
- logging вместо print для продакшн кода
- Virtual environment инструкции

═══════════════════════════════════════════════════════
🌐 WEB (HTML/CSS/JS) — СПЕЦИАЛЬНЫЕ ПРАВИЛА
═══════════════════════════════════════════════════════

- Валидный HTML5: DOCTYPE, meta charset, viewport
- Семантические теги: header, main, nav, section, article, footer
- CSS: responsive design, media queries, flexbox/grid
- JavaScript: ES6+ (const/let, arrow functions, destructuring, modules)
- Доступность: alt, aria-labels, tabindex, role
- SEO: meta description, title, proper headings
- Производительность: lazy loading, минимизация DOM манипуляций
- Безопасность: sanitize input, CSP headers

═══════════════════════════════════════════════════════
🔍 АНАЛИЗ КОДА — КОГДА ПОЛЬЗОВАТЕЛЬ ПОКАЗЫВАЕТ СВОЙ КОД
═══════════════════════════════════════════════════════

Когда пользователь показывает код для анализа/исправления:
1. Определи язык программирования
2. Найди ВСЕ ошибки (синтаксические, логические, стилевые)
3. Объясни КАЖДУЮ ошибку простым языком
4. Предложи ИСПРАВЛЕННУЮ версию целиком
5. Укажи потенциальные проблемы безопасности
6. Предложи оптимизации если есть
7. Оцени общее качество кода

═══════════════════════════════════════════════════════
📁 МНОГОФАЙЛОВЫЕ ПРОЕКТЫ
═══════════════════════════════════════════════════════

Для проектов из нескольких файлов:
1. Покажи структуру проекта (дерево папок)
2. Каждый файл в отдельном блоке кода с указанием пути
3. Укажи порядок создания файлов
4. Инструкции по установке зависимостей
5. Инструкции по запуску

Формат:
📁 project-name/
├── 📄 package.json
├── 📄 index.js
├── 📁 src/
│   ├── 📄 app.js
│   └── 📁 routes/
│       └── 📄 api.js
└── 📄 README.md

Затем каждый файл:
\`\`\`javascript
// 📄 src/app.js
// by GIV BOX AI
...код...
\`\`\`

═══════════════════════════════════════════════════════
✅ ДРУГИЕ НАВЫКИ
═══════════════════════════════════════════════════════

- Рецепты и Кулинария (детальные, пошаговые)
- Домашние задания (Математика, Физика, История — объяснять понятно)
- Шутки, Загадки, Интересные факты
- Советы (Здоровье, Карьера, Жизнь)
- Эссе, Стихи, Рассказы, Творчество
- Описание мест (ТОЛЬКО если РЕАЛЬНО знаешь)

🌍 ФИЛЬТР ПРАВДЫ — ГЕОГРАФИЯ:
Если спрашивают о месте:
  - ЗНАЕШЬ → детальное описание
  - НЕ ЗНАЕШЬ → честно признайся, НЕ ВЫДУМЫВАЙ

═══════════════════════════════════════════════════════
🎭 ПОВЕДЕНИЕ
═══════════════════════════════════════════════════════

- Дружелюбный, умный, с чувством юмора
- Решай задачи пошагово
- Пиши ИДЕАЛЬНЫЙ код без ошибок
- НИКОГДА не обрезай код
- ВСЕГДА подписывай код "by GIV BOX AI"
- Если не знаешь — скажи честно
- Для сложных задач предложи несколько подходов`;

// === СПЕЦИАЛИЗИРОВАННЫЕ ПРОМПТЫ ДЛЯ РАЗНЫХ ЗАДАЧ ===
const CODE_BOOST_PROMPT = `
ADDITIONAL CODE INSTRUCTIONS:
- You are now in CODE MODE. Focus 100% on writing perfect, production-ready code.
- Think step by step before writing.
- Consider edge cases, error handling, and performance.
- Use the most modern and idiomatic syntax for the target language.
- If the task is complex, break it into smaller functions/modules.
- Add TODO comments for potential future improvements.
- If a design decision is needed, explain your choice briefly.
`;

const ANALYSIS_BOOST_PROMPT = `
ADDITIONAL ANALYSIS INSTRUCTIONS:
- You are now in CODE ANALYSIS MODE.
- Be thorough and precise in your analysis.
- Categorize issues: 🔴 Critical, 🟡 Warning, 🔵 Suggestion
- Check for: bugs, security issues, performance problems, code style
- Provide a corrected version of the code.
- Rate the code quality: ⭐ out of 5 stars.
`;

const DEBUG_BOOST_PROMPT = `
ADDITIONAL DEBUG INSTRUCTIONS:
- You are now in DEBUG MODE.
- Carefully trace through the code logic.
- Identify the exact line(s) causing the issue.
- Explain WHY the bug occurs.
- Provide a minimal fix, then a comprehensive fix.
- Suggest how to prevent similar bugs in the future.
`;

// === RATE LIMITING ===
const rateLimits = new Map();

function checkRate(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { requests: [], lastRequest: 0 });
  }
  const u = rateLimits.get(ip);

  // Минимальный интервал между запросами — 2 секунды
  if (u.lastRequest > 0 && (now - u.lastRequest) < 2000) {
    return { allowed: false, reason: 'Подождите пару секунд', retryAfter: 2 };
  }

  // Чистим старые записи
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
  // Грубая оценка: 1 токен ≈ 4 символа
  const charLimit = maxTokenEstimate * 4;

  let totalChars = 0;
  for (const m of messages) {
    totalChars += (m.content || '').length;
  }

  // Если всё влезает — возвращаем как есть
  if (totalChars <= charLimit) return messages;

  // Стратегия: оставляем первые 2 + последние N сообщений
  const result = [];

  // Первые 2 сообщения (для контекста)
  if (messages.length > 4) {
    result.push(messages[0]);
    result.push(messages[1]);
    result.push({
      role: 'system',
      content: '[...предыдущие сообщения сжаты для экономии контекста...]'
    });
  }

  // Последние сообщения — самые важные
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

// === ГЛАВНАЯ ФУНКЦИЯ AI ===
async function callAI(apiKey, userMessages, systemPrompt, options = {}) {
  try {
    // Определяем тип задачи из последнего сообщения
    const lastUserMessage = [...userMessages]
      .reverse()
      .find(m => m.role === 'user' || !m.role);
    const lastText = lastUserMessage
      ? String(lastUserMessage.content || lastUserMessage.text || '')
      : '';

    const taskType = detectTaskType(lastText);
    const detectedLangs = detectLanguages(lastText);

    // Выбираем модель на основе типа задачи
    let selectedModel = MODELS.chat;
    if (taskType === 'code') selectedModel = MODELS.code;
    else if (taskType === 'analysis') selectedModel = MODELS.analysis;

    // Позволяем переопределить модель
    if (options.model) selectedModel = options.model;

    // Формируем системный промпт
    let finalSystemPrompt = String(systemPrompt || DEFAULT_SYSTEM_PROMPT);

    // Добавляем буст-промпт по типу задачи
    if (taskType === 'code') {
      finalSystemPrompt += '\n\n' + CODE_BOOST_PROMPT;

      // Добавляем контекст о детектированных языках
      if (detectedLangs.length > 0) {
        const langNames = detectedLangs.slice(0, 3).map(d => d.lang).join(', ');
        finalSystemPrompt += `\nDetected programming language(s): ${langNames}. ` +
          `Focus your expertise on these technologies.`;
      }
    } else if (taskType === 'analysis') {
      finalSystemPrompt += '\n\n' + ANALYSIS_BOOST_PROMPT;
    }

    // Проверяем есть ли слова про дебаг
    const debugWords = ['debug', 'отладь', 'не работает', 'ошибка', 'error',
                        'bug', 'fix', 'исправь', 'crash', 'падает', 'broken'];
    if (debugWords.some(w => lastText.toLowerCase().includes(w))) {
      finalSystemPrompt += '\n\n' + DEBUG_BOOST_PROMPT;
    }

    // Собираем сообщения
    const messages = [];
    messages.push({ role: 'system', content: finalSystemPrompt });

    // Обрабатываем историю
    const processedMessages = [];
    for (let i = 0; i < userMessages.length; i++) {
      const m = userMessages[i];
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      const text = String(m.content || m.text || '').slice(0, 20000);
      if (text.trim() !== '') {
        processedMessages.push({ role, content: text });
      }
    }

    // Умное сжатие если история слишком длинная
    const compressed = compressHistory(processedMessages);
    messages.push(...compressed);

    // Параметры генерации — адаптивные
    let temperature = 0.3; // Точнее для кода
    let maxTokens = 8192;
    let topP = 0.9;

    if (taskType === 'code') {
      temperature = 0.15; // Ещё точнее для кода
      maxTokens = 8192;
      topP = 0.85;
    } else if (taskType === 'chat') {
      temperature = 0.6; // Креативнее для разговора
      maxTokens = 4096;
      topP = 0.95;
    }

    // Переопределение из опций
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

    // === ПЕРВЫЙ ЗАПРОС ===
    let res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    let responseText = await res.text();

    // === ФОЛЛБЭК НА ДРУГУЮ МОДЕЛЬ ===
    if (!res.ok && (res.status === 503 || res.status === 500)) {
      console.log(`Model ${selectedModel} unavailable, trying fallback...`);

      // Пробуем фоллбэк модель
      requestBody.model = MODELS.fallback;
      res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      responseText = await res.text();

      // Если и фоллбэк не работает — пробуем chat модель
      if (!res.ok) {
        requestBody.model = MODELS.chat;
        res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        responseText = await res.text();
      }
    }

    // === ОБРАБОТКА ОШИБОК ===
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
      return { error: true, message: '❌ Ошибка парсинга JSON ответа' };
    }

    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    } else if (Array.isArray(data) && data[0] && data[0].generated_text) {
      content = data[0].generated_text;
    }

    if (!content || content.trim() === '') {
      return { error: true, message: '❌ Пустой ответ от модели' };
    }

    // === АВТОПРОДОЛЖЕНИЕ ДЛЯ ДЛИННОГО КОДА ===
    let finishReason = data.choices && data.choices[0] && data.choices[0].finish_reason;
    let attempts = 0;
    const maxContinuations = 5; // Больше попыток для очень длинного кода

    while (finishReason === 'length' && attempts < maxContinuations) {
      attempts++;
      console.log(`Auto-continue attempt ${attempts}/${maxContinuations}`);

      // Анализируем обрезанный контент
      const hasOpenCodeBlock = (content.match(/```/g) || []).length % 2 !== 0;
      const lastLines = content.split('\n').slice(-5).join('\n');

      let continuePrompt = '';
      if (hasOpenCodeBlock) {
        continuePrompt = 'Код был обрезан. Продолжи ТОЧНО с места обрыва. ' +
          'НЕ начинай заново. НЕ повторяй написанное. ' +
          'Продолжи с того же блока кода. ' +
          `Последние строки были:\n\`\`\`\n${lastLines}\n\`\`\``;
      } else {
        continuePrompt = 'Ответ был обрезан. Продолжи ТОЧНО с места обрыва. ' +
          'НЕ повторяй уже написанное.';
      }

      const continueMessages = [...messages];
      continueMessages.push({ role: 'assistant', content: content });
      continueMessages.push({ role: 'user', content: continuePrompt });

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
          temperature: 0.15, // Минимальная температура для продолжения
          top_p: 0.85,
          stream: false
        })
      });

      if (!contRes.ok) {
        console.log('Continue request failed:', contRes.status);
        break;
      }

      let contData;
      try {
        contData = JSON.parse(await contRes.text());
      } catch (e) {
        console.log('Continue parse error');
        break;
      }

      const contContent = contData.choices && contData.choices[0] &&
                           contData.choices[0].message && contData.choices[0].message.content;
      if (!contContent || contContent.trim() === '') break;

      // Умная склейка — убираем дублирование
      const cleanCont = removeDuplicatePrefix(content, contContent);
      content += '\n' + cleanCont;

      finishReason = contData.choices[0].finish_reason;
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
    console.error('callAI error:', e);
    return {
      error: true,
      message: '❌ Ошибка соединения: ' + e.message
    };
  }
}

// === УДАЛЕНИЕ ДУБЛИРОВАНИЯ ПРИ СКЛЕЙКЕ ===
function removeDuplicatePrefix(existingContent, newContent) {
  // Ищем перекрытие — если начало нового совпадает с концом старого
  const existingLines = existingContent.split('\n');
  const newLines = newContent.split('\n');

  // Проверяем последние 10 строк существующего контента
  const checkLines = Math.min(10, existingLines.length);
  for (let overlap = checkLines; overlap >= 3; overlap--) {
    const existingTail = existingLines.slice(-overlap).join('\n').trim();
    const newHead = newLines.slice(0, overlap).join('\n').trim();

    if (existingTail === newHead) {
      // Нашли дублирование — убираем его
      return newLines.slice(overlap).join('\n');
    }
  }

  return newContent;
}

// === ПОСТ-ОБРАБОТКА КОДА ===
function postProcessCode(content) {
  // Проверяем незакрытые блоки кода
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    content += '\n```';
  }

  // Убираем лишние пустые строки (больше 2 подряд)
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
