/**
 * Scanner — Codebase static analysis module
 *
 * Extracted from templates.js (Phase 3 refactor).
 * Handles: file walking, language detection, framework detection, package manager detection.
 */

const path = require('path');
const fs = require('fs-extra');

// ============================================================
// CONSTANTS
// ============================================================

/**
 * Extension → language/type mapping
 */
const EXT_MAP = {
  // JavaScript / TypeScript
  '.js': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.jsx': 'JavaScript (React)',
  // Python
  '.py': 'Python',
  // Ruby
  '.rb': 'Ruby',
  // Go
  '.go': 'Go',
  // JVM
  '.java': 'Java', '.kt': 'Kotlin',
  // .NET
  '.cs': 'C#', '.fs': 'F#',
  // Systems
  '.cpp': 'C++', '.c': 'C', '.rs': 'Rust', '.swift': 'Swift',
  // PHP
  '.php': 'PHP',
  // Dart/Flutter
  '.dart': 'Dart',
  // Web frameworks
  '.vue': 'Vue', '.svelte': 'Svelte',
  // Config / Data
  '.json': 'JSON', '.yaml': 'YAML', '.yml': 'YAML', '.toml': 'TOML',
  '.sql': 'SQL', '.graphql': 'GraphQL',
  // Shell
  '.sh': 'Shell', '.bash': 'Shell',
  // Web
  '.html': 'HTML', '.css': 'CSS', '.scss': 'SCSS', '.sass': 'SASS',
  // Docs
  '.md': 'Markdown',
};

/** Directories to skip when scanning */
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.nuxt', 'dist', 'build',
  'out', 'coverage', '.cache', 'vendor', '__pycache__', '.venv',
  'venv', 'env', 'target', 'bin', 'obj', '.v-flow',
  // Flutter/Dart
  '.dart_tool', '.fvm', '.pub-cache',
  // iOS/macOS
  'Pods', '.symlinks',
  // Android
  '.gradle',
]);

/** Framework detection patterns: { dep or file → label } */
const FRAMEWORK_PATTERNS = [
  // JS/TS
  { dep: 'next', label: 'Next.js' },
  { dep: 'nuxt', label: 'Nuxt.js' },
  { dep: 'react', label: 'React' },
  { dep: 'vue', label: 'Vue.js' },
  { dep: 'svelte', label: 'Svelte' },
  { dep: 'express', label: 'Express.js' },
  { dep: 'fastify', label: 'Fastify' },
  { dep: 'nestjs/core', label: 'NestJS' },
  { dep: '@nestjs/core', label: 'NestJS' },
  { dep: 'hono', label: 'Hono' },
  { dep: 'koa', label: 'Koa' },
  { dep: 'remix', label: 'Remix' },
  { dep: 'astro', label: 'Astro' },
  // Python
  { dep: 'django', label: 'Django' },
  { dep: 'flask', label: 'Flask' },
  { dep: 'fastapi', label: 'FastAPI' },
  // Java/Kotlin
  { dep: 'spring-boot', label: 'Spring Boot' },
  // Dart/Flutter
  { dep: 'flutter', label: 'Flutter' },
  { dep: 'riverpod', label: 'Riverpod' },
  { dep: 'bloc', label: 'BLoC' },
  { dep: 'provider', label: 'Provider' },
  { dep: 'get', label: 'GetX' },
  // .NET
  { dep: 'Microsoft.AspNetCore', label: 'ASP.NET Core' },
  { dep: 'Microsoft.EntityFrameworkCore', label: 'Entity Framework' },
  // Rust
  { dep: 'actix-web', label: 'Actix Web' },
  { dep: 'axum', label: 'Axum' },
  { dep: 'rocket', label: 'Rocket' },
  { dep: 'tokio', label: 'Tokio' },
  // Go
  { dep: 'gin-gonic/gin', label: 'Gin' },
  { dep: 'gorilla/mux', label: 'Gorilla Mux' },
  { dep: 'labstack/echo', label: 'Echo' },
  { dep: 'gofiber/fiber', label: 'Fiber' },
  // Testing
  { dep: 'jest', label: 'Jest' },
  { dep: 'vitest', label: 'Vitest' },
  { dep: 'pytest', label: 'pytest' },
  { dep: 'mocha', label: 'Mocha' },
  { dep: 'cypress', label: 'Cypress' },
  { dep: 'playwright', label: 'Playwright' },
  { dep: 'flutter_test', label: 'flutter_test' },
  { dep: 'mockito', label: 'Mockito' },
  { dep: 'xunit', label: 'xUnit' },
  { dep: 'nunit', label: 'NUnit' },
  // DB / ORM
  { dep: 'prisma', label: 'Prisma' },
  { dep: 'typeorm', label: 'TypeORM' },
  { dep: 'sequelize', label: 'Sequelize' },
  { dep: 'mongoose', label: 'Mongoose' },
  { dep: 'sqlalchemy', label: 'SQLAlchemy' },
  { dep: 'drizzle-orm', label: 'Drizzle' },
  // Infrastructure
  { dep: 'docker', label: 'Docker', fileOnly: true },
  { dep: 'terraform', label: 'Terraform', fileOnly: true },
];

/** Languages considered "code" (for primary language ranking) */
const CODE_LANGUAGES = [
  'JavaScript', 'TypeScript', 'JavaScript (React)', 'Python', 'Ruby', 'Go',
  'Java', 'Kotlin', 'C#', 'F#', 'PHP', 'Rust', 'Swift', 'Dart',
  'C++', 'C', 'Vue', 'Svelte',
];

/** Testing framework labels (used to separate from regular frameworks) */
const TESTING_LABELS = [
  'Jest', 'Vitest', 'Mocha', 'Cypress', 'Playwright', 'pytest',
  'flutter_test', 'Mockito', 'xUnit', 'NUnit',
];

// ============================================================
// FILE WALKING
// ============================================================

/**
 * Walk directory recursively, collecting file stats.
 * @returns {{ extCounts, totalFiles, testFiles, configFiles, entrypoints }}
 */
async function walkDir(dir, depth = 0, acc = null) {
  if (!acc) {
    acc = { extCounts: {}, totalFiles: 0, testFiles: [], configFiles: [], entrypoints: [] };
  }
  if (depth > 8) return acc;

  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walkDir(fullPath, depth + 1, acc);
    } else if (entry.isFile()) {
      acc.totalFiles++;
      const ext = path.extname(entry.name).toLowerCase();
      if (EXT_MAP[ext]) {
        acc.extCounts[EXT_MAP[ext]] = (acc.extCounts[EXT_MAP[ext]] || 0) + 1;
      }

      const name = entry.name.toLowerCase();

      // Detect test files
      if (isTestFile(name)) {
        acc.testFiles.push(path.relative(dir, fullPath));
      }

      // Detect config files
      if (isConfigFile(name)) {
        acc.configFiles.push(entry.name);
      }

      // Detect likely entrypoints
      if (isEntrypoint(name) && depth <= 3) {
        acc.entrypoints.push(entry.name);
      }
    }
  }
  return acc;
}

/** Check if filename looks like a test file */
function isTestFile(name) {
  return (
    name.includes('.test.') ||
    name.includes('.spec.') ||
    name.startsWith('test_') ||
    name.endsWith('_test.js') ||
    name.endsWith('_test.ts') ||
    name.endsWith('_test.dart') ||
    name.endsWith('_test.go') ||
    name.endsWith('_test.py') ||
    name.endsWith('_test.rs')
  );
}

/** Check if filename is a project config file */
function isConfigFile(name) {
  const configNames = [
    'package.json', 'pom.xml', 'build.gradle', 'build.gradle.kts',
    'requirements.txt', 'pyproject.toml', 'cargo.toml',
    'go.mod', 'go.sum',
    'pubspec.yaml',
    'dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
    '.csproj', '.sln', '.fsproj',
    'gemfile', 'mix.exs',
  ];
  return configNames.includes(name) || name.endsWith('.csproj') || name.endsWith('.sln');
}

/** Check if filename is a likely entrypoint */
function isEntrypoint(name) {
  const entryNames = [
    'main.js', 'main.ts', 'index.js', 'index.ts',
    'app.js', 'app.ts', 'server.js', 'server.ts',
    'main.py', 'app.py', 'main.go',
    'main.java', 'main.dart', 'main.rs',
    'program.cs',
  ];
  return entryNames.includes(name);
}

// ============================================================
// DEPENDENCY READERS
// ============================================================

/**
 * Read package.json and return { name, version, deps, devDeps, scripts }
 */
async function readPackageJson(projectRoot) {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = await fs.readJson(pkgPath);
    return {
      name: pkg.name || '',
      version: pkg.version || '',
      deps: Object.keys(pkg.dependencies || {}),
      devDeps: Object.keys(pkg.devDependencies || {}),
      scripts: Object.keys(pkg.scripts || {}),
    };
  } catch {
    return null;
  }
}

/**
 * Read requirements.txt (Python)
 */
async function readRequirementsTxt(projectRoot) {
  const reqPath = path.join(projectRoot, 'requirements.txt');
  if (!fs.existsSync(reqPath)) return [];
  try {
    const content = await fs.readFile(reqPath, 'utf8');
    return content.split('\n')
      .map(l => l.split('==')[0].split('>=')[0].split('~=')[0].trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Read pubspec.yaml (Flutter/Dart) — simple regex-based parser
 */
async function readPubspecYaml(projectRoot) {
  const pubspecPath = path.join(projectRoot, 'pubspec.yaml');
  if (!fs.existsSync(pubspecPath)) return null;
  try {
    const content = await fs.readFile(pubspecPath, 'utf8');
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const versionMatch = content.match(/^version:\s*(.+)$/m);

    // Extract dependency names (lines under dependencies: / dev_dependencies:)
    const deps = [];
    const depSections = content.match(/(?:dependencies|dev_dependencies):\s*\n((?:  .+\n)*)/g) || [];
    for (const section of depSections) {
      const depLines = section.match(/^\s{2}(\w[\w_-]*?):/gm) || [];
      for (const line of depLines) {
        const depName = line.trim().replace(':', '');
        deps.push(depName);
      }
    }

    return {
      name: nameMatch ? nameMatch[1].trim() : '',
      version: versionMatch ? versionMatch[1].trim() : '',
      deps,
    };
  } catch {
    return null;
  }
}

/**
 * Read Cargo.toml (Rust) — simple regex-based parser
 */
async function readCargoToml(projectRoot) {
  const cargoPath = path.join(projectRoot, 'Cargo.toml');
  if (!fs.existsSync(cargoPath)) return null;
  try {
    const content = await fs.readFile(cargoPath, 'utf8');
    const nameMatch = content.match(/^name\s*=\s*"(.+)"/m);

    const deps = [];
    const depSection = content.match(/\[dependencies\]([\s\S]*?)(?:\[|$)/);
    if (depSection) {
      const depLines = depSection[1].match(/^(\w[\w_-]*?)\s*=/gm) || [];
      for (const line of depLines) {
        deps.push(line.replace(/\s*=.*/, '').trim());
      }
    }

    return {
      name: nameMatch ? nameMatch[1] : '',
      deps,
    };
  } catch {
    return null;
  }
}

/**
 * Read go.mod (Go) — extract module name and dependencies
 */
async function readGoMod(projectRoot) {
  const goModPath = path.join(projectRoot, 'go.mod');
  if (!fs.existsSync(goModPath)) return null;
  try {
    const content = await fs.readFile(goModPath, 'utf8');
    const moduleMatch = content.match(/^module\s+(.+)$/m);

    const deps = [];
    const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
    if (requireBlock) {
      const depLines = requireBlock[1].match(/^\s*(\S+)/gm) || [];
      for (const line of depLines) {
        deps.push(line.trim());
      }
    }

    return {
      name: moduleMatch ? moduleMatch[1].trim() : '',
      deps,
    };
  } catch {
    return null;
  }
}

// ============================================================
// FRAMEWORK DETECTION
// ============================================================

/**
 * Detect frameworks from deps array
 */
function detectFrameworks(deps) {
  const detected = [];
  const allDeps = deps.join(' ').toLowerCase();
  for (const { dep, label } of FRAMEWORK_PATTERNS) {
    if (allDeps.includes(dep.toLowerCase())) {
      detected.push(label);
    }
  }
  return [...new Set(detected)];
}

/**
 * Detect frameworks from config files (Dockerfile, CI configs, etc.)
 */
function detectFromConfigFiles(configFiles) {
  const detected = [];
  const names = configFiles.map(f => f.toLowerCase());

  if (names.some(n => n === 'dockerfile' || n.startsWith('docker-compose'))) {
    detected.push('Docker');
  }
  if (names.some(n => n === '.github/workflows' || n.endsWith('.yml'))) {
    // GitHub Actions detected separately
  }

  return detected;
}

// ============================================================
// PACKAGE MANAGER DETECTION
// ============================================================

/**
 * Detect package manager from lock files and config files
 */
function detectPackageManager(projectRoot) {
  const checks = [
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'bun.lockb', manager: 'bun' },
    { file: 'package-lock.json', manager: 'npm' },
    { file: 'pubspec.lock', manager: 'pub' },
    { file: 'requirements.txt', manager: 'pip' },
    { file: 'Pipfile.lock', manager: 'pipenv' },
    { file: 'poetry.lock', manager: 'poetry' },
    { file: 'go.sum', manager: 'go modules' },
    { file: 'go.mod', manager: 'go modules' },
    { file: 'pom.xml', manager: 'Maven' },
    { file: 'build.gradle', manager: 'Gradle' },
    { file: 'build.gradle.kts', manager: 'Gradle' },
    { file: 'Cargo.lock', manager: 'Cargo' },
    { file: 'Cargo.toml', manager: 'Cargo' },
    { file: 'Gemfile.lock', manager: 'Bundler' },
    { file: 'mix.lock', manager: 'Mix' },
  ];

  for (const { file, manager } of checks) {
    if (fs.existsSync(path.join(projectRoot, file))) {
      return manager;
    }
  }

  return 'unknown';
}

// ============================================================
// MAIN SCANNER
// ============================================================

/**
 * Main scanner — runs all static analysis and returns a summary object
 */
async function scanCodebase(projectRoot) {
  const today = new Date().toISOString().split('T')[0];
  const result = {
    scannedAt: today,
    projectName: path.basename(projectRoot),
    languages: [],
    frameworks: [],
    testingTools: [],
    hasTests: false,
    testFileCount: 0,
    totalFiles: 0,
    entrypoints: [],
    configFiles: [],
    packageManager: 'unknown',
    rawExtCounts: {},
  };

  // Walk directory
  const walk = await walkDir(projectRoot);
  result.totalFiles = walk.totalFiles;
  result.testFileCount = walk.testFiles.length;
  result.hasTests = walk.testFiles.length > 0;
  result.entrypoints = [...new Set(walk.entrypoints)].slice(0, 5);
  result.configFiles = walk.configFiles;
  result.rawExtCounts = walk.extCounts;

  // Top languages (exclude non-code types)
  result.languages = Object.entries(walk.extCounts)
    .filter(([lang]) => CODE_LANGUAGES.includes(lang))
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang)
    .slice(0, 5);

  // Package manager detection
  result.packageManager = detectPackageManager(projectRoot);

  // Framework detection from package.json (Node.js)
  const pkg = await readPackageJson(projectRoot);
  if (pkg) {
    const allDeps = [...pkg.deps, ...pkg.devDeps];
    const allFrameworks = detectFrameworks(allDeps);
    result.testingTools = allFrameworks.filter(f => TESTING_LABELS.includes(f));
    result.frameworks = allFrameworks.filter(f => !TESTING_LABELS.includes(f));
  }

  // Python deps
  const pyDeps = await readRequirementsTxt(projectRoot);
  if (pyDeps.length > 0) {
    const pyFrameworks = detectFrameworks(pyDeps);
    result.frameworks.push(...pyFrameworks.filter(f => !result.frameworks.includes(f)));
  }

  // Dart/Flutter deps
  const pubspec = await readPubspecYaml(projectRoot);
  if (pubspec) {
    if (pubspec.name && !pkg) {
      result.projectName = pubspec.name;
    }
    const dartFrameworks = detectFrameworks(pubspec.deps);
    const dartTesting = dartFrameworks.filter(f => TESTING_LABELS.includes(f));
    const dartRegular = dartFrameworks.filter(f => !TESTING_LABELS.includes(f));
    result.frameworks.push(...dartRegular.filter(f => !result.frameworks.includes(f)));
    result.testingTools.push(...dartTesting.filter(f => !result.testingTools.includes(f)));
  }

  // Rust deps
  const cargo = await readCargoToml(projectRoot);
  if (cargo) {
    if (cargo.name && !pkg && !pubspec) {
      result.projectName = cargo.name;
    }
    const rustFrameworks = detectFrameworks(cargo.deps);
    result.frameworks.push(...rustFrameworks.filter(f => !result.frameworks.includes(f)));
  }

  // Go deps
  const goMod = await readGoMod(projectRoot);
  if (goMod) {
    if (goMod.name && !pkg && !pubspec && !cargo) {
      result.projectName = path.basename(goMod.name);
    }
    const goFrameworks = detectFrameworks(goMod.deps);
    result.frameworks.push(...goFrameworks.filter(f => !result.frameworks.includes(f)));
  }

  // Config-file-based detection (Docker, etc.)
  const configFrameworks = detectFromConfigFiles(walk.configFiles);
  result.frameworks.push(...configFrameworks.filter(f => !result.frameworks.includes(f)));

  return result;
}

// ============================================================
// CONTEXT.MD GENERATOR
// ============================================================

/**
 * Generate context.md content from scan result
 */
function generateContextMd(scan) {
  const langList = scan.languages.length > 0 ? scan.languages.join(', ') : '*(chưa phát hiện — tự điền)*';
  const frameworkList = scan.frameworks.length > 0 ? scan.frameworks.join(', ') : '*(chưa phát hiện — tự điền)*';
  const testingList = scan.testingTools.length > 0 ? scan.testingTools.join(', ') : '*(không tìm thấy)*';
  const hasTests = scan.hasTests ? `✅ Có (${scan.testFileCount} test files phát hiện)` : '❌ Không tìm thấy test files';
  const entrypointList = scan.entrypoints.length > 0
    ? scan.entrypoints.map(e => `| \`${e}\` | *(tự điền mô tả)* |`).join('\n')
    : '| *(tự xác định)* | |';

  return `# context.md — Codebase Understanding Report

> **Phase**: U.0 (Understand)
> **Dự án**: ${scan.projectName}
> **Ngày tạo**: ${scan.scannedAt} (auto-generated by v-flow init)
> **Cập nhật lần cuối**: ${scan.scannedAt}
> **Người review**: *(Tech Lead cần review và bổ sung)*

---

## ⚠️ Nguyên tắc của file này

> **Ghi thực trạng** — không phải "should be". Không lý tưởng hóa.
> File này là **input bắt buộc** cho mọi Agent trước khi làm feature trên dự án này.
> Các mục đánh dấu \`*(tự điền)*\` cần được Tech Lead bổ sung thủ công.

---

## 1. Tech Stack Thực Tế

*🤖 Auto-detected (${scan.scannedAt}) — ${scan.totalFiles} files scanned*

| Hạng mục | Công nghệ |
|----------|-----------|
| **Ngôn ngữ chính** | ${langList} |
| **Framework** | ${frameworkList} |
| **Package manager** | ${scan.packageManager} |
| **Testing** | ${testingList} |
| **Database** | *(tự điền)* |
| **Cache** | *(tự điền)* |
| **CI/CD** | *(tự điền)* |
| **Deployment** | *(tự điền)* |

---

## 2. Kiến Trúc Thực Tế

> ⚠️ Mô tả kiến trúc như nó đang tồn tại, không phải lý tưởng.

### Cấu trúc thư mục chính

\`\`\`
*(Tech Lead điền vào — chạy \`tree -d -L 2\` hoặc xem trong IDE)*
\`\`\`

### Các Layer / Module chính

| Module | Vai trò | File/Folder chính |
|--------|---------|------------------|
| *(tự điền)* | | |

---

## 3. Entry Points

*🤖 Phát hiện tự động — kiểm tra lại độ chính xác*

| Entry Point | File phát hiện |
|-------------|---------------|
${entrypointList}
| *(bổ sung thêm nếu cần)* | |

---

## 4. 🚫 No-Go Zones

> **Đây là luật**: Agent KHÔNG được tự ý sửa các vùng này.
> *(Tech Lead điền vào — là phần quan trọng nhất cần bổ sung)*

| Vùng code | Lý do không nên đụng | Rủi ro |
|-----------|---------------------|--------|
| *(tự điền)* | | Cao/Trung/Thấp |

---

## 5. Technical Debt Nổi Bật

| Mức độ | Mô tả | Kế hoạch fix |
|--------|-------|--------------|
| 🔴 Cao | *(tự điền)* | |
| 🟡 Trung bình | *(tự điền)* | |

---

## 6. Test Coverage Hiện Tại

*🤖 Auto-detected*

| Loại | Kết quả |
|------|---------|
| Test files phát hiện | ${scan.testFileCount} files |
| Có test không? | ${hasTests} |
| Coverage ước tính | *(chạy test để biết chính xác)* |

**Vùng không có test** (nguy hiểm nhất):
- [ ] *(Tech Lead điền vào)*

---

## 7. Patterns Đang Dùng (Dù Không Chính Thức)

*(Tech Lead điền vào sau khi review codebase)*

- **Naming**: *(xyz)*
- **Error handling**: *(xyz)*
- **State management**: *(xyz)*

---

## 8. Lịch Sử Cập Nhật

| Ngày | Người cập nhật | Lý do cập nhật |
|------|---------------|----------------|
| ${scan.scannedAt} | v-flow init | Tạo mới (U.0 auto-scan) |
`;
}

module.exports = {
  // Constants (exported for testing)
  EXT_MAP,
  SKIP_DIRS,
  FRAMEWORK_PATTERNS,
  CODE_LANGUAGES,
  TESTING_LABELS,
  // Functions
  walkDir,
  isTestFile,
  isConfigFile,
  isEntrypoint,
  readPackageJson,
  readRequirementsTxt,
  readPubspecYaml,
  readCargoToml,
  readGoMod,
  detectFrameworks,
  detectFromConfigFiles,
  detectPackageManager,
  scanCodebase,
  generateContextMd,
};
