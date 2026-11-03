/**
 * Constitution Lint — Automated Constitution Enforcement
 *
 * Parses [LINT:xxx] tags from constitution.md and validates
 * source code / project structure against extracted rules.
 *
 * Rule tag format:
 *   - [LINT:naming]           → file/variable naming rules
 *   - [LINT:import]           → import/dependency rules
 *   - [LINT:structure]        → folder/file structure rules
 *   - [LINT:error]            → error handling rules
 *   - [LINT:test]             → testing requirements
 *   - [LINT:security]         → security rules
 *   - [LINT:doc]              → documentation rules
 *   - [LINT:arch]             → architecture/layering (forbidden cross-layer imports)
 *   - [LINT:xxx:critical]     → critical severity (blocks CI)
 *
 * Backward-compatible: constitutions without [LINT:xxx] tags
 * return "0 rules found, skip" — no behavior change.
 */

const path = require('path');
const fs = require('fs-extra');

// ════════════════════════════════════════════════════════════
// RULE CATEGORIES
// ════════════════════════════════════════════════════════════

const VALID_CATEGORIES = [
  'naming',
  'import',
  'structure',
  'error',
  'test',
  'security',
  'doc',
  'style',
  'api',
  'arch',
];

const SEVERITY = {
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// ════════════════════════════════════════════════════════════
// PARSER — Extract [LINT:xxx] rules from constitution.md
// ════════════════════════════════════════════════════════════

/**
 * Parse constitution.md content and extract lintable rules.
 *
 * Each line containing [LINT:category] becomes a rule.
 * Optional :critical suffix sets severity to CRITICAL.
 *
 * @param {string} content — constitution.md file content
 * @returns {{ rules: Array<{id, category, severity, text, section, lineNumber}>, parseErrors: string[] }}
 */
function parseConstitution(content) {
  const rules = [];
  const parseErrors = [];
  const lines = content.split('\n');

  let currentSection = 'Unknown';
  let ruleIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track current section heading
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      currentSection = headingMatch[1].trim();
      continue;
    }

    // Look for [LINT:xxx] tags
    const lintMatch = line.match(/\[LINT:([a-z]+)(?::([a-z]+))?\]/i);
    if (!lintMatch) continue;

    const category = lintMatch[1].toLowerCase();
    const modifier = lintMatch[2] ? lintMatch[2].toLowerCase() : null;

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      parseErrors.push(`Line ${lineNumber}: Unknown LINT category "${category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
      continue;
    }

    // Determine severity
    let severity = SEVERITY.ERROR;
    if (modifier === 'critical') {
      severity = SEVERITY.CRITICAL;
    } else if (modifier === 'warn' || modifier === 'warning') {
      severity = SEVERITY.WARNING;
    }

    // Extract rule text (everything after the [LINT:xxx] tag)
    const ruleText = line
      .replace(/\[LINT:[^\]]+\]/i, '')
      .replace(/^[-*]\s*/, '')
      .trim();

    if (!ruleText) {
      parseErrors.push(`Line ${lineNumber}: [LINT:${category}] tag found but no rule text`);
      continue;
    }

    ruleIndex++;
    rules.push({
      id: `CL-${String(ruleIndex).padStart(3, '0')}`,
      category,
      severity,
      text: ruleText,
      section: currentSection,
      lineNumber,
      raw: line.trim(),
    });
  }

  return { rules, parseErrors };
}

// ════════════════════════════════════════════════════════════
// RULE ENGINE — Check rules against source files
// ════════════════════════════════════════════════════════════

/**
 * Built-in rule checkers by category.
 * Each checker receives (rule, projectRoot, options) and returns violations[].
 */
const RULE_CHECKERS = {
  /**
   * Naming convention rules.
   * Checks filenames against patterns extracted from rule text.
   */
  naming: async (rule, projectRoot, options) => {
    const violations = [];
    const srcDir = options.srcDir || path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return violations;

    const text = rule.text.toLowerCase();

    // Detect kebab-case requirement
    if (text.includes('kebab-case') || text.includes('kebab case')) {
      const files = await walkFiles(srcDir, options.extensions || ['.js', '.ts', '.jsx', '.tsx', '.vue']);
      for (const file of files) {
        const basename = path.basename(file, path.extname(file));
        // Skip index files and dotfiles
        if (basename === 'index' || basename.startsWith('.')) continue;
        // Check if NOT kebab-case (allow lowercase-only too)
        if (basename !== basename.toLowerCase() || /[A-Z_]/.test(basename)) {
          // Allow UPPER_CASE constants files
          if (basename === basename.toUpperCase()) continue;
          violations.push({
            ruleId: rule.id,
            severity: rule.severity,
            file: path.relative(projectRoot, file),
            message: `Filename "${path.basename(file)}" is not kebab-case`,
            rule: rule.text,
          });
        }
      }
    }

    // Detect PascalCase requirement for components
    if (text.includes('pascalcase') || text.includes('pascal case') || text.includes('pascal-case')) {
      const files = await walkFiles(srcDir, options.extensions || ['.jsx', '.tsx', '.vue']);
      for (const file of files) {
        const basename = path.basename(file, path.extname(file));
        if (basename === 'index') continue;
        if (!/^[A-Z]/.test(basename)) {
          violations.push({
            ruleId: rule.id,
            severity: rule.severity,
            file: path.relative(projectRoot, file),
            message: `Component file "${path.basename(file)}" should be PascalCase`,
            rule: rule.text,
          });
        }
      }
    }

    return violations;
  },

  /**
   * Import/dependency rules.
   * Checks for forbidden imports.
   */
  import: async (rule, projectRoot, options) => {
    const violations = [];
    const srcDir = options.srcDir || path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return violations;

    const text = rule.text.toLowerCase();

    // Detect forbidden import patterns
    const forbiddenMatch = rule.text.match(/(?:không|don't|never|cấm|forbidden|prohibit).*(?:import|require).*[`"']([^`"']+)[`"']/i);
    if (forbiddenMatch) {
      const forbiddenModule = forbiddenMatch[1];
      const files = await walkFiles(srcDir, ['.js', '.ts', '.jsx', '.tsx']);
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        if (content.includes(forbiddenModule)) {
          const lineNum = findLineNumber(content, forbiddenModule);
          violations.push({
            ruleId: rule.id,
            severity: rule.severity,
            file: path.relative(projectRoot, file),
            line: lineNum,
            message: `Forbidden import/require: "${forbiddenModule}"`,
            rule: rule.text,
          });
        }
      }
    }

    return violations;
  },

  /**
   * Structure rules.
   * Checks folder/file existence.
   */
  structure: async (rule, projectRoot, _options) => {
    const violations = [];
    const text = rule.text;

    // Check for required directory patterns
    const dirMatch = text.match(/(?:must have|phải có|bắt buộc có).*(?:folder|directory|thư mục).*[`"']([^`"']+)[`"']/i);
    if (dirMatch) {
      const requiredDir = dirMatch[1];
      const fullPath = path.join(projectRoot, requiredDir);
      if (!fs.existsSync(fullPath)) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          file: requiredDir,
          message: `Required directory "${requiredDir}" not found`,
          rule: rule.text,
        });
      }
    }

    // Check for required file patterns
    const fileMatch = text.match(/(?:must have|phải có|bắt buộc có).*(?:file).*[`"']([^`"']+)[`"']/i);
    if (fileMatch) {
      const requiredFile = fileMatch[1];
      const fullPath = path.join(projectRoot, requiredFile);
      if (!fs.existsSync(fullPath)) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          file: requiredFile,
          message: `Required file "${requiredFile}" not found`,
          rule: rule.text,
        });
      }
    }

    return violations;
  },

  /**
   * Error handling rules.
   * Checks for patterns like unhandled async, raw string throws.
   */
  error: async (rule, projectRoot, options) => {
    const violations = [];
    const srcDir = options.srcDir || path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return violations;

    const text = rule.text.toLowerCase();

    // Check for raw string throws
    if (text.includes('throw') && (text.includes('string') || text.includes('raw') || text.includes('error class'))) {
      const files = await walkFiles(srcDir, ['.js', '.ts']);
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        const rawThrows = content.match(/throw\s+['"`]/g);
        if (rawThrows) {
          violations.push({
            ruleId: rule.id,
            severity: rule.severity,
            file: path.relative(projectRoot, file),
            message: `Found ${rawThrows.length} raw string throw(s) — use Error class instead`,
            rule: rule.text,
          });
        }
      }
    }

    return violations;
  },

  /**
   * Test rules.
   * Checks for test file existence patterns.
   */
  test: async (rule, projectRoot, options) => {
    const violations = [];
    const srcDir = options.srcDir || path.join(projectRoot, 'src');
    const testDir = options.testDir || path.join(projectRoot, 'tests');
    if (!fs.existsSync(srcDir) || !fs.existsSync(testDir)) return violations;

    const text = rule.text.toLowerCase();

    // Check for "every module must have test" type rules
    if (text.includes('test') && (text.includes('every') || text.includes('mỗi') || text.includes('tất cả'))) {
      const sourceFiles = await walkFiles(srcDir, ['.js', '.ts']);
      const testFiles = await walkFiles(testDir, ['.test.js', '.test.ts', '.spec.js', '.spec.ts']);
      const testBasenames = testFiles.map(f => path.basename(f).replace(/\.(test|spec)\.(js|ts)$/, ''));

      for (const srcFile of sourceFiles) {
        const basename = path.basename(srcFile, path.extname(srcFile));
        if (basename === 'index') continue;
        if (!testBasenames.includes(basename)) {
          violations.push({
            ruleId: rule.id,
            severity: SEVERITY.WARNING, // Always warn, not error
            file: path.relative(projectRoot, srcFile),
            message: `No test file found for "${basename}"`,
            rule: rule.text,
          });
        }
      }
    }

    return violations;
  },

  /**
   * Security rules — basic pattern detection.
   */
  security: async (rule, projectRoot, options) => {
    const violations = [];
    const srcDir = options.srcDir || path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) return violations;

    const text = rule.text.toLowerCase();

    // Check for hardcoded secrets pattern
    if (text.includes('hardcod') || text.includes('secret') || text.includes('password') || text.includes('api key')) {
      const files = await walkFiles(srcDir, ['.js', '.ts', '.jsx', '.tsx']);
      const patterns = [
        /(?:password|secret|api_key|apikey|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
      ];
      for (const file of files) {
        const content = await fs.readFile(file, 'utf8');
        for (const pattern of patterns) {
          pattern.lastIndex = 0;
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              ruleId: rule.id,
              severity: SEVERITY.CRITICAL,
              file: path.relative(projectRoot, file),
              message: `Possible hardcoded secret found (${matches.length} occurrence(s))`,
              rule: rule.text,
            });
          }
        }
      }
    }

    return violations;
  },

  /**
   * Documentation rules.
   */
  doc: async (rule, projectRoot, options) => {
    const violations = [];
    const text = rule.text.toLowerCase();

    // Check for README requirement
    if (text.includes('readme')) {
      const readmePath = path.join(projectRoot, 'README.md');
      if (!fs.existsSync(readmePath)) {
        violations.push({
          ruleId: rule.id,
          severity: rule.severity,
          file: 'README.md',
          message: 'README.md not found at project root',
          rule: rule.text,
        });
      }
    }

    return violations;
  },

  /**
   * Architecture rules — layering / import-boundary enforcement.
   *
   * Detects rules of the form "files under '<A>' must not import from '<B>'"
   * (two path tokens + a prohibition word), walks files under A, and flags any
   * import/require whose specifier resolves into B. This is the mechanical
   * "enforce architecture, don't just document it" gate.
   *
   * Example: - [LINT:arch] Layer `src/domain` không được import từ `src/infra`
   */
  arch: async (rule, projectRoot, options) => {
    const violations = [];
    const tokens = [...rule.text.matchAll(/[`'"]([^`'"]+)[`'"]/g)].map(m => m[1]);
    const forbids = /không|not|never|cấm|forbidden|must\s*not|prohibit/i.test(rule.text);
    if (tokens.length < 2 || !forbids) return violations; // need source + target + a prohibition

    const norm = (p) => p.replace(/^\.\//, '').replace(/\/+$/, '');
    const sourceRel = norm(tokens[0]);
    const targetRel = norm(tokens[1]);
    const sourceAbs = path.resolve(projectRoot, sourceRel);
    const targetAbs = path.resolve(projectRoot, targetRel);
    if (!fs.existsSync(sourceAbs)) return violations;

    const files = await walkFiles(sourceAbs, options.extensions || ['.js', '.ts', '.jsx', '.tsx', '.vue', '.mjs']);
    const targetBase = path.basename(targetRel);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/(?:from|require\s*\(|import)\s*['"]([^'"]+)['"]/);
        if (!m) continue;
        const spec = m[1];
        let hit;
        if (spec.startsWith('.')) {
          const resolved = path.resolve(path.dirname(file), spec);
          hit = resolved === targetAbs || resolved.startsWith(targetAbs + path.sep);
        } else {
          // bare/alias import (e.g. '@/infra/db', 'src/infra/db')
          hit = spec.includes(targetRel) || spec.includes(`/${targetBase}/`) || spec.endsWith(`/${targetBase}`);
        }
        if (hit) {
          violations.push({
            ruleId: rule.id,
            severity: rule.severity,
            file: path.relative(projectRoot, file),
            line: i + 1,
            message: `Layering violation: import "${spec}" — vùng "${targetRel}" bị cấm cho layer "${sourceRel}"`,
            rule: rule.text,
          });
        }
      }
    }
    return violations;
  },

  // Fallback for categories without dedicated checkers
  style: async () => [],
  api: async () => [],
};

// ════════════════════════════════════════════════════════════
// LINT RUNNER
// ════════════════════════════════════════════════════════════

/**
 * Run all lint rules from a parsed constitution against the project.
 *
 * @param {Array} rules — Parsed rules from parseConstitution()
 * @param {string} projectRoot — Project root directory
 * @param {object} options — { srcDir, testDir, extensions, verbose }
 * @returns {{ violations: Array, stats: { total, errors, warnings, critical, passed } }}
 */
async function runConstitutionLint(rules, projectRoot, options = {}) {
  const violations = [];

  for (const rule of rules) {
    const checker = RULE_CHECKERS[rule.category];
    if (!checker) continue;

    try {
      const ruleViolations = await checker(rule, projectRoot, options);
      violations.push(...ruleViolations);
    } catch (err) {
      if (options.verbose) {
        violations.push({
          ruleId: rule.id,
          severity: SEVERITY.WARNING,
          file: 'constitution.md',
          message: `Rule check error: ${err.message}`,
          rule: rule.text,
        });
      }
    }
  }

  const stats = {
    total: rules.length,
    errors: violations.filter(v => v.severity === SEVERITY.ERROR).length,
    warnings: violations.filter(v => v.severity === SEVERITY.WARNING).length,
    critical: violations.filter(v => v.severity === SEVERITY.CRITICAL).length,
    passed: rules.length - new Set(violations.map(v => v.ruleId)).size,
  };

  return { violations, stats };
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Recursively walk a directory and return files matching extensions.
 */
async function walkFiles(dir, extensions) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
      const sub = await walkFiles(fullPath, extensions);
      results.push(...sub);
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Find the line number of a pattern in content.
 */
function findLineNumber(content, pattern) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(pattern)) return i + 1;
  }
  return 0;
}

/**
 * Format a violation for display.
 */
function formatViolation(violation) {
  const icon = violation.severity === SEVERITY.CRITICAL ? '🔴'
    : violation.severity === SEVERITY.ERROR ? '❌'
      : '⚠️ ';
  const loc = violation.line ? `${violation.file}:${violation.line}` : violation.file;
  return `${icon} [${violation.ruleId}] ${loc} → ${violation.message}`;
}

module.exports = {
  VALID_CATEGORIES,
  SEVERITY,
  parseConstitution,
  runConstitutionLint,
  formatViolation,
  walkFiles,
  findLineNumber,
};
