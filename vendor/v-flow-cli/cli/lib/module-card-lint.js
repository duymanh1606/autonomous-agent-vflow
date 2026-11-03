/**
 * Module Card Lint — Structural validation for Understand-tier knowledge artifacts
 *
 * Validates module cards in `.v-flow/modules/domain-xxx/`:
 *   - File completeness (required card files present)
 *   - SKILL.md required headings (HEADING MAP)
 *   - Leftover template placeholders / unscanned markers
 *   - business-quiz.md: questions phrased in BUSINESS language, not code
 *
 * SCOPE — same charter as cli/commands/validate.js: this is STRUCTURAL lint only.
 * It does NOT judge whether a question is "a good business question" (that is the
 * BA/human answer-key's job, per business-quiz.md design). It only flags
 * deterministic signals that a quiz question leaked code vocabulary — the concrete
 * "BA đọc không hiểu vì dính code" pain. Default severity = warning; the validate
 * command's --strict flag escalates. Markdown-first + regex is intentional.
 *
 * All functions are pure (content/path in → result out) so they unit-test cleanly.
 */

const path = require('path');
const fs = require('fs-extra');

// ════════════════════════════════════════════════════════════
// CARD STRUCTURE CONTRACT
// ════════════════════════════════════════════════════════════

/** Files every generated module card must contain. */
const REQUIRED_CARD_FILES = [
  'SKILL.md',
  'use-cases.md',
  'api-specs.md',
  'tech-context.md',
  'cross-service.md',
  'db.md',
  'state-diagram.md',
  'permissions.md',
  'business-quiz.md',
  'dev-quiz.md',
];

/** Present only when the module has a frontend — absence is not an error. */
const OPTIONAL_CARD_FILES = ['ui-flows.md'];

/** Headings SKILL.md must contain (from its HEADING MAP). */
const REQUIRED_SKILL_HEADINGS = [
  '## Quick Summary',
  '## Key Business Rules',
  '## Key Entities',
  '## No-Go Zones',          // matched loosely (emoji/suffix tolerated)
  '## 📂 Supporting Files',
];

/** Headings business-quiz.md must contain. */
const REQUIRED_QUIZ_HEADINGS = [
  '## MUST',
  '## SHOULD',
];

// High-signal residue that should never survive in a real, scanned card.
const UNSCANNED_MARKER = /\[❓[^\]]*\]/;            // [❓ CẦN SCAN CODE] → issue
const LITERAL_DATE_PLACEHOLDER = /\bYYYY-MM-DD\b/;   // unfilled date → warning
// Raw template tokens (curly placeholders that carry template instruction words).
const TEMPLATE_TOKEN = /\{(Tên|tên|version|date|Câu hỏi|Lý do|N |~X|file_thực|function_thực|EntityName|table_name|field\d|RelatedEntity|mô tả|danh sách|giải thích|đoạn code|rule|Rule)[^}]*\}/;
const AI_INFERRED_MARKER = /\[⚠️\s*AI-inferred\]/g;  // unverified business rule → count

// ════════════════════════════════════════════════════════════
// BUSINESS-QUIZ CODE-TOKEN DETECTION
// ════════════════════════════════════════════════════════════

/**
 * Deterministic signals that a question is phrased in CODE rather than BUSINESS
 * language. Each is a strong signal in Vietnamese prose (which uses neither
 * underscores nor internal capitals nor backticks).
 */
const CODE_TOKEN_PATTERNS = [
  { name: 'backtick code', re: /`[^`]+`/g },
  { name: 'file/extension', re: /\b[\w/-]+\.(?:js|jsx|ts|tsx|dart|java|py|rb|go|php|cs|sql|ya?ml|json|kt|swift|cpp|hpp)\b/gi },
  { name: 'function call', re: /\b[A-Za-z_]\w*\(\s*\)/g },
  { name: 'camelCase', re: /\b[a-z][a-z0-9]*[A-Z][A-Za-z0-9]*\b/g },
  { name: 'snake_case', re: /\b[a-z][a-z0-9]*_[a-z0-9_]+\b/g },
  { name: 'CONSTANT_CASE', re: /\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/g },
  { name: 'API endpoint', re: /\/(?:api|v\d)\/[\w/{}-]+/gi },
];

/** Remove HTML comments so template guidance/examples are never linted. */
function stripComments(content) {
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Extract quiz questions from business-quiz.md.
 * @returns {Array<{id, name, questionText}>}
 */
function extractQuizQuestions(content) {
  const clean = stripComments(content);
  const lines = clean.split('\n');
  const questions = [];

  let current = null;
  let capturing = false;       // inside the question body
  let sawLabel = false;        // an explicit "**Câu hỏi**" label was seen for `current`
  let buffer = [];

  const flush = () => {
    if (current) {
      current.questionText = buffer.join('\n').trim();
      questions.push(current);
    }
    buffer = [];
    capturing = false;
    sawLabel = false;
  };

  // Accept "**Câu hỏi**", "**Câu hỏi:**", "** Câu hỏi **", with/without trailing colon.
  const QUESTION_LABEL = /^\s*\*\*\s*Câu hỏi\s*:?\s*\*\*\s*:?\s*/i;
  // A body ends at the next bold field ("**Lý do…**"), a divider, or a heading.
  const isStop = (l) => /^\s*\*\*/.test(l) || /^---\s*$/.test(l) || /^#{2,3}\s/.test(l);

  for (const line of lines) {
    const qHeading = line.match(/^###\s+(Q\d+)\s*[:.)-]?\s*(.*)$/i);
    if (qHeading) {
      flush();
      current = { id: qHeading[1].toUpperCase(), name: (qHeading[2] || '').replace(/\[.*?\]/g, '').trim(), questionText: '' };
      continue;
    }
    if (!current) continue;

    // Explicit "**Câu hỏi**" label → capture the rest of this line + following body.
    if (QUESTION_LABEL.test(line)) {
      capturing = true;
      sawLabel = true;
      buffer.push(line.replace(QUESTION_LABEL, ''));
      continue;
    }
    if (capturing) {
      if (isStop(line)) { capturing = false; continue; }
      buffer.push(line);
      continue;
    }
    // Fallback: no "**Câu hỏi**" label — treat the first prose line(s) directly
    // under "### QNN" as the question body (cards that omit the label still count).
    if (!sawLabel && buffer.length === 0 && line.trim() && !isStop(line)) {
      capturing = true;
      buffer.push(line);
    }
  }
  flush();

  return questions.filter((q) => q.questionText.length > 0);
}

/**
 * Find unique code tokens in a question's text.
 * @returns {Array<{token, kind}>}
 */
function findCodeTokens(questionText) {
  const found = new Map(); // token → kind (first match wins)
  for (const { name, re } of CODE_TOKEN_PATTERNS) {
    const matches = questionText.match(re);
    if (!matches) continue;
    for (const m of matches) {
      const token = m.trim();
      if (token && !found.has(token)) found.set(token, name);
    }
  }
  return [...found.entries()].map(([token, kind]) => ({ token, kind }));
}

/**
 * Lint a business-quiz.md for code-coupled questions + structure.
 * @param {string} content
 * @returns {{ issues: string[], warnings: string[], ok: string[] }}
 */
function lintBusinessQuiz(content) {
  const issues = [];
  const warnings = [];
  const ok = [];

  // Required headings — tolerant match (emoji/case/suffix ok), same spirit as
  // SKILL.md's hasHeading. The template ships "## MUST — Câu Hỏi Bắt Buộc" and
  // authors add emoji ("## 🔴 MUST …"); a strict substring check false-flagged those.
  const clean = stripComments(content);
  for (const h of REQUIRED_QUIZ_HEADINGS) {
    if (!hasHeading(clean, h)) {
      issues.push(`business-quiz.md: thiếu heading "${h}" (hoặc biến thể MUST/SHOULD)`);
    }
  }

  // Answer-leak: the file is designed to contain NO answers (human is the key).
  if (/^#{2,3}\s+(Đáp án|Answer|Đáp Án)\b/im.test(clean)) {
    warnings.push('business-quiz.md: phát hiện mục "Đáp án/Answer" — file quiz KHÔNG được chứa đáp án (human BA/PO là answer key)');
  }

  const questions = extractQuizQuestions(content);
  if (questions.length === 0) {
    warnings.push('business-quiz.md: không tìm thấy câu hỏi nào (### Q01 …)');
    return { issues, warnings, ok };
  }

  let leaked = 0;
  for (const q of questions) {
    const tokens = findCodeTokens(q.questionText);
    if (tokens.length === 0) continue;
    leaked++;
    const preview = tokens.slice(0, 5).map((t) => `${t.token} (${t.kind})`).join(', ');
    const more = tokens.length > 5 ? ` …+${tokens.length - 5}` : '';
    warnings.push(`${q.id}: câu hỏi dính ngôn ngữ code → BA khó đọc: ${preview}${more}`);
  }

  if (leaked === 0) {
    ok.push(`${questions.length} câu hỏi đều dùng ngôn ngữ nghiệp vụ (không dính code)`);
  } else {
    ok.push(`${questions.length - leaked}/${questions.length} câu hỏi dùng ngôn ngữ nghiệp vụ`);
  }

  return { issues, warnings, ok };
}

// ════════════════════════════════════════════════════════════
// CARD STRUCTURE VALIDATION
// ════════════════════════════════════════════════════════════

/** Loose heading presence check (tolerates emoji / trailing qualifiers). */
function hasHeading(content, heading) {
  if (content.includes(heading)) return true;
  // Match on the core text after stripping emoji/punct for No-Go style headings.
  const core = heading.replace(/^#+\s*/, '').replace(/[^\p{L}\p{N} ]/gu, '').trim().toLowerCase();
  return content
    .split('\n')
    .some((l) => /^#{2,3}\s/.test(l) && l.replace(/[^\p{L}\p{N} ]/gu, '').toLowerCase().includes(core));
}

/**
 * Validate one module-card directory (files + headings + placeholders).
 * Pure over an injected file map for testability; the CLI passes a real reader.
 *
 * @param {string} cardName — e.g. "domain-orders"
 * @param {(file: string) => (string|null)} readFile — returns content or null if absent
 * @returns {{ issues: string[], warnings: string[], ok: string[] }}
 */
function validateModuleCardStructure(cardName, readFile) {
  const issues = [];
  const warnings = [];
  const ok = [];

  // 1. Required files present
  const missing = [];
  const present = [];
  for (const f of REQUIRED_CARD_FILES) {
    if (readFile(f) == null) missing.push(f);
    else present.push(f);
  }
  if (missing.length) issues.push(`thiếu file bắt buộc: ${missing.join(', ')}`);
  else ok.push(`đủ ${REQUIRED_CARD_FILES.length} file card bắt buộc`);

  for (const f of OPTIONAL_CARD_FILES) {
    if (readFile(f) != null) present.push(f);
  }

  // 2. SKILL.md headings
  const skill = readFile('SKILL.md');
  if (skill != null) {
    const skillClean = stripComments(skill);
    const missingH = REQUIRED_SKILL_HEADINGS.filter((h) => !hasHeading(skillClean, h));
    if (missingH.length) issues.push(`SKILL.md: thiếu heading: ${missingH.join(' · ')}`);
    else ok.push('SKILL.md đủ heading bắt buộc');
  }

  // 3. Placeholder / unscanned-marker sweep across present files
  let aiInferred = 0;
  for (const f of present) {
    const content = readFile(f);
    if (content == null) continue;
    const clean = stripComments(content);
    if (UNSCANNED_MARKER.test(clean)) {
      issues.push(`${f}: còn marker chưa scan code (❓ CẦN SCAN) — card chưa đối chiếu code thật`);
    }
    if (TEMPLATE_TOKEN.test(clean)) {
      warnings.push(`${f}: còn placeholder template chưa điền ({…})`);
    }
    if (LITERAL_DATE_PLACEHOLDER.test(clean)) {
      warnings.push(`${f}: còn ngày placeholder "YYYY-MM-DD" chưa điền`);
    }
    const inferred = clean.match(AI_INFERRED_MARKER);
    if (inferred) aiInferred += inferred.length;
  }
  if (aiInferred > 0) {
    warnings.push(`${aiInferred} business rule còn nhãn [⚠️ AI-inferred] — chưa được human xác nhận`);
  }

  return { issues, warnings, ok };
}

module.exports = {
  REQUIRED_CARD_FILES,
  OPTIONAL_CARD_FILES,
  REQUIRED_SKILL_HEADINGS,
  CODE_TOKEN_PATTERNS,
  stripComments,
  extractQuizQuestions,
  findCodeTokens,
  lintBusinessQuiz,
  validateModuleCardStructure,
};
