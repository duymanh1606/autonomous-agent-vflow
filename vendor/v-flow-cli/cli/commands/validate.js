/**
 * v-flow validate — Validate V-Flow artifact structure and quality
 *
 * Checks spec/plan/tasks/test-cases for required sections, EARS compliance,
 * REQ/AC traceability, dependency-graph integrity, and cross-file consistency
 * (spec↔plan↔tasks).
 *
 * SCOPE — đọc trước khi mở rộng: đây là LINT CẤU TRÚC + CROSS-REF, KHÔNG phải
 * kiểm tra ngữ nghĩa. Cố ý KHÔNG verify "Done khi có khớp nội dung AC không",
 * "design có đúng không"… — đó là việc của Master Check Agent (R.0, agent-driven)
 * + human review. Đừng đẩy validator sang semantic-checking: markdown-first + regex
 * là chủ ý cho pipeline LLM. Phân vai: validator = structural lint · Master Check =
 * semantic · human = judgment.
 *
 * Phạm vi lint: spec / plan / tasks / test-cases (4 artifact lõi). Các artifact phụ
 * data-model / api-contract / ux-checklist / validation-report KHÔNG lint cấu trúc ở
 * đây — coverage/đúng-sai của chúng do Master Check (R.0) + human chịu trách nhiệm.
 */

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { isInitialized, getVFlowDir, listFeatures } = require('../lib/templates');
const { withErrorHandler, requireInit, printOk, printWarn, printError, printDim } = require('../lib/cli-error');
const { createT } = require('../lib/i18n');
const { parseConstitution, runConstitutionLint, formatViolation, SEVERITY } = require('../lib/constitution-lint');
const { parseJUnitResults, checkAcTestPass } = require('../lib/ac-test-gate');
const { lintBusinessQuiz, validateModuleCardStructure } = require('../lib/module-card-lint');
const { readFlowState } = require('../lib/yaml-parser');
const { checkGovernance } = require('../lib/governance');
const { sliceGate } = require('../lib/slicing/service');

// Current artifact-schema generation. New features stamp `schema_version` in
// .flow-state.yaml. A feature stamped older than this (or unstamped) is "legacy":
// its NEW-schema warnings (TDD/AC-ID/DDL/Tech-Decisions/annotation-completeness/
// plan↔tasks…) are shown as advisory and do NOT gate `--strict`, so bumping the
// schema doesn't break in-flight work created with an older template.
const SCHEMA_VERSION = '2.0';

/** True if a feature's stamped schema version is older than current (or missing). */
function schemaIsLegacy(featureVer, current = SCHEMA_VERSION) {
  if (!featureVer) return true;
  const a = parseFloat(featureVer);
  if (Number.isNaN(a)) return true;
  return a < parseFloat(current);
}

/** Read schema_version from a feature's .flow-state.yaml (regex — no yaml dep needed). */
function readFeatureSchemaVersion(featureDir) {
  try {
    const p = path.join(featureDir, '.flow-state.yaml');
    if (!fs.existsSync(p)) return null;
    const m = fs.readFileSync(p, 'utf8').match(/^\s*schema_version:\s*["']?([\d.]+)/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Read pipeline_type (full|quickfix|hotfix) from .flow-state.yaml → drives the "lite" profile. */
function readPipelineType(featureDir) {
  try {
    const p = path.join(featureDir, '.flow-state.yaml');
    if (!fs.existsSync(p)) return null;
    const m = fs.readFileSync(p, 'utf8').match(/pipeline_type:\s*["']?(\w+)/);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

// Quickfix/hotfix = "lite" profile: small change, process-heavy nudges (Tech Decisions,
// NFR section) are relaxed so a 1–2 task fix isn't drowned in advisory warnings.
function isLiteProfile(pipelineType) {
  return pipelineType === 'quickfix' || pipelineType === 'hotfix';
}

/** Optional per-project tuning: .v-flow/validate.config.json { ignore:[substr], ignoreFeatures:[name] }. */
function readValidateConfig(projectRoot) {
  try {
    const p = path.join(getVFlowDir(projectRoot), 'validate.config.json');
    if (!fs.existsSync(p)) return { ignore: [], ignoreFeatures: [] };
    const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
    return {
      ignore: Array.isArray(cfg.ignore) ? cfg.ignore : [],
      ignoreFeatures: Array.isArray(cfg.ignoreFeatures) ? cfg.ignoreFeatures : [],
    };
  } catch {
    return { ignore: [], ignoreFeatures: [] };
  }
}

/** Drop findings whose message matches any ignore substring (artifact-level rules). Mutates result; returns #suppressed. */
function applyIgnore(result, ignore) {
  if (!ignore || ignore.length === 0) return 0;
  const hit = (s) => ignore.some(p => s.includes(p));
  let suppressed = 0;
  for (const k of ['issues', 'warnings']) {
    const before = result[k].length;
    result[k] = result[k].filter(m => !hit(m));
    suppressed += before - result[k].length;
  }
  return suppressed;
}

// ════════════════════════════════════════════════════════════
// VALIDATION RULES
// ════════════════════════════════════════════════════════════

/**
 * Validate spec.md structure and EARS compliance
 */
function validateSpec(content, filePath) {
  const issues = [];
  const warnings = [];
  const ok = [];

  // Required sections
  const requiredHeadings = [
    { pattern: /^##\s+.*requirements/im, label: 'Requirements section' },
  ];

  for (const { pattern, label } of requiredHeadings) {
    if (pattern.test(content)) {
      ok.push(label);
    } else {
      issues.push(`Missing: ${label}`);
    }
  }

  // Check for REQ-xxx entries
  const reqMatches = content.match(/REQ-[A-Z]\d+/g) || [];
  const uniqueReqs = [...new Set(reqMatches)];
  if (uniqueReqs.length > 0) {
    ok.push(`${uniqueReqs.length} requirement(s) found: ${uniqueReqs.join(', ')}`);
  } else {
    issues.push('No REQ-xxx identifiers found — spec should use EARS notation');
  }

  // EARS notation check
  const earsTypes = {
    'REQ-U': 'Ubiquitous',
    'REQ-E': 'Event-driven',
    'REQ-S': 'State-driven',
    'REQ-O': 'Optional',
  };
  const usedTypes = [];
  for (const [prefix, label] of Object.entries(earsTypes)) {
    if (uniqueReqs.some(r => r.startsWith(prefix))) {
      usedTypes.push(label);
    }
  }
  if (usedTypes.length > 0) {
    ok.push(`EARS types used: ${usedTypes.join(', ')}`);
  } else if (uniqueReqs.length > 0) {
    warnings.push('No EARS type prefixes detected (REQ-U/E/S/O) — consider using EARS notation');
  }

  // Acceptance Criteria check
  const acPattern = /acceptance\s*criteria|tiêu\s*chí\s*chấp\s*nhận/i;
  if (acPattern.test(content)) {
    ok.push('Acceptance Criteria section found');
  } else {
    warnings.push('No Acceptance Criteria section detected — REQs should have ACs');
  }

  // Acceptance Criterion IDs (AC-NN) — enable AC↔task coverage cross-check
  const uniqueAcs = [...new Set(content.match(/\bAC-\d+\b/g) || [])];
  if (uniqueAcs.length > 0) {
    ok.push(`${uniqueAcs.length} acceptance criterion ID(s) found (AC-NN)`);
  } else if (acPattern.test(content)) {
    warnings.push('Acceptance Criteria nên đánh mã AC-NN — để task "Done khi" tham chiếu và cross-check coverage');
  }

  // Out of Scope check
  const oosPattern = /out\s*of\s*scope|ngoài\s*phạm\s*vi|không\s*bao\s*gồm/i;
  if (oosPattern.test(content)) {
    ok.push('Out of Scope section found');
  } else {
    warnings.push('Consider adding Out of Scope section to prevent scope creep');
  }

  // Use Case Specification check
  const ucMatches = content.match(/UC-\d+/g) || [];
  const uniqueUcs = [...new Set(ucMatches)];
  if (uniqueUcs.length > 0) {
    ok.push(`${uniqueUcs.length} use case(s) found: ${uniqueUcs.join(', ')}`);

    // Each detailed use case should describe preconditions, postconditions, and screens
    const ucDetailChecks = [
      { pattern: /điều\s*kiện\s*trước|precondition/i, label: 'Preconditions (Điều kiện trước)' },
      { pattern: /điều\s*kiện\s*sau|postcondition/i, label: 'Postconditions (Điều kiện sau)' },
      { pattern: /hành\s*động\s*của\s*tác\s*nhân|phản\s*ứng\s*của\s*hệ\s*thống/i, label: 'Main flow (Hành động tác nhân ↔ Phản ứng hệ thống)' },
      { pattern: /luồng\s*ngoại\s*lệ|exception|alternative\s*flow/i, label: 'Exception flows (Luồng ngoại lệ)' },
      { pattern: /yêu\s*cầu\s*đặc\s*biệt|special\s*requirement/i, label: 'Special requirements (Yêu cầu đặc biệt)' },
      { pattern: /mô\s*tả\s*màn\s*hình|screen\s*\/?\s*ui/i, label: 'Screen description (Mô tả màn hình)' },
    ];
    for (const { pattern, label } of ucDetailChecks) {
      if (!pattern.test(content)) {
        warnings.push(`Use case spec missing: ${label}`);
      }
    }
  } else {
    warnings.push('No UC-xx identifiers found — spec should detail use cases (Đặc tả Use Case chi tiết)');
  }

  // Surface whether the spec declares per-UC NFR ("Yêu cầu đặc biệt") so we can
  // later cross-check that the plan carries an NFR section (else NFR rots silently).
  const hasSpecialReqs = /yêu\s*cầu\s*đặc\s*biệt|special\s*requirement/i.test(content);

  return { issues, warnings, ok, reqCount: uniqueReqs.length, reqs: uniqueReqs, ucCount: uniqueUcs.length, ucs: uniqueUcs, hasSpecialReqs, acs: uniqueAcs };
}

/**
 * Validate plan.md structure
 */
function validatePlan(content, filePath, opts = {}) {
  const issues = [];
  const warnings = [];
  const ok = [];
  const lite = Boolean(opts.lite); // quickfix/hotfix: relax process-heavy nudges

  // Check for REQ references (traceability)
  const reqRefs = content.match(/REQ-[A-Z]\d+/g) || [];
  if (reqRefs.length > 0) {
    ok.push(`${new Set(reqRefs).size} REQ reference(s) found — traceability exists`);
  } else {
    issues.push('No REQ-xxx references — plan must trace back to spec requirements');
  }

  // Check for architecture section
  if (/architecture|kiến\s*trúc|component|layer/i.test(content)) {
    ok.push('Architecture/component section detected');
  } else {
    warnings.push('No architecture section detected');
  }

  // Check for file structure section
  if (/file\s*structure|file\s*changes|cấu\s*trúc\s*file|file\s*mới|file\s*sửa|directory|thư\s*mục/i.test(content)) {
    ok.push('File structure section detected');
  } else if (!lite) {
    warnings.push('Consider documenting file structure in plan');
  }

  // Use case traceability
  const ucRefs = content.match(/UC-\d+/g) || [];
  if (ucRefs.length > 0) {
    ok.push(`${new Set(ucRefs).size} use case reference(s) found`);
  } else {
    warnings.push('No UC-xx references — plan should trace to use cases in spec');
  }

  // UI / Screen Changes section
  if (/screen\s*changes|màn\s*hình|ui\s*\//i.test(content)) {
    ok.push('UI/Screen Changes section detected');
  } else {
    warnings.push('No UI/Screen Changes section — add §5 if feature has screens (link UC + DESIGN.md tokens)');
  }

  // Database migrations (when schema is touched)
  const touchesDb = /\bmigration\b|ALTER\s+TABLE|CREATE\s+TABLE|\bschema\b/i.test(content);
  const hasMigrationSection = /database\s*migrations|\bmigration\b/i.test(content);
  if (touchesDb && !hasMigrationSection) {
    warnings.push('Plan references DB/schema but has no Migrations section (§3.4: bảng/cột/rollback)');
  }

  // Concrete DDL — when a structured schema-change table exists (NEW/ALTER rows),
  // the plan should carry real DDL (or equivalent ORM commands), not just the table,
  // so the dev doesn't have to guess the statement. Presence-only (no SQL linting).
  const hasSchemaChangeRow = /\|\s*(NEW|ALTER)\s*\|/i.test(content);
  const hasDDL = /alter\s+table|create\s+table|create\s+index|drop\s+(table|column|index)/i.test(content);
  if (hasSchemaChangeRow && !hasDDL) {
    warnings.push('§3.4 có bảng schema change (NEW/ALTER) nhưng thiếu DDL thật (ALTER/CREATE…) — ghi câu lệnh up+down hoặc lệnh ORM tương đương, đừng để dev đoán');
  }

  // Modify-file specificity (only when a "File sửa đổi" section actually exists)
  const hasModifySection = /file\s*sửa\s*đổi|files?\s*modified/i.test(content);
  if (hasModifySection && !/vị\s*trí|hiện\s*trạng|symbol/i.test(content)) {
    warnings.push('File sửa đổi nên ghi "Vị trí (symbol)" + "Hiện trạng → Mong muốn", không mô tả chung chung');
  }

  // Does the plan carry an NFR section (§10)? Used for spec↔plan NFR cross-check.
  const hasNfr = /non-functional|\bnfr\b|phi\s*chức\s*năng/i.test(content);

  // Tech Decisions section (WHY + alternatives) — the design rationale needs a home
  const hasTechDecisions = /tech\s*decision|quyết\s*định\s*kỹ\s*thuật|alternatives|phương\s*án\s*đã/i.test(content);
  if (!hasTechDecisions && !lite) {
    warnings.push('Plan thiếu mục Tech Decisions (WHY + phương án đã cân nhắc/loại) — lý do thiết kế dễ thất lạc');
  }

  // File paths referenced (backtick path-like tokens) — for plan↔tasks consistency.
  // Strip fenced code blocks (``` … ```) FIRST so mermaid/code fences don't corrupt
  // inline-backtick pairing; then take single-line `code` spans. Keep dir tokens
  // (ending in /) so "test/products/" can cover "test/products/x.js".
  const inlineSrc = content.replace(/```[\s\S]*?```/g, '');
  const planFiles = [...new Set((inlineSrc.match(/`([^`\n]+)`/g) || [])
    .map(t => t.replace(/`/g, '').trim())
    .filter(t => t.includes('/') && (/\.\w{1,6}$/.test(t) || t.endsWith('/'))))];

  return { issues, warnings, ok, hasNfr, reqs: [...new Set(reqRefs)], files: planFiles };
}

/**
 * Normalize a task id (T-001 / TASK-01 / TASK-1) → canonical key "t<number>"
 * so dependency refs match headers regardless of convention/padding.
 */
function normTaskId(raw) {
  const m = raw.match(/(?:T|TASK)-0*(\d+)/i);
  return m ? `t${m[1]}` : raw.toLowerCase();
}

/**
 * Build the task dependency graph from tasks.md.
 * Returns { graph: Map<displayId, Set<displayId>>, danglingRefs: Set<rawRef> }.
 * Deps are read from both header annotations `[DEPENDS: T-xxx]` and a
 * `**Dependency**:` / `**Depends on**:` field within each task block.
 */
function parseTaskGraph(content) {
  const headerRe = /^#{2,4}\s*((?:T|TASK)-\d+)\b/gim;
  const heads = [];
  let m;
  while ((m = headerRe.exec(content)) !== null) {
    heads.push({ id: m[1], norm: normTaskId(m[1]), index: m.index });
  }
  const idByNorm = new Map();
  for (const h of heads) idByNorm.set(h.norm, h.id);

  const graph = new Map();
  const danglingRefs = new Set();
  for (let i = 0; i < heads.length; i++) {
    const start = heads[i].index;
    const end = i + 1 < heads.length ? heads[i + 1].index : content.length;
    const block = content.slice(start, end);
    const refs = [];
    let d;
    const depAnno = /\[DEPENDS:\s*([^\]]+)\]/gi;
    while ((d = depAnno.exec(block)) !== null) refs.push(...(d[1].match(/(?:T|TASK)-\d+/gi) || []));
    const depField = /\*\*\s*(?:Dependency|Dependencies|Depends on)\s*\*\*\s*:?\s*([^\n]+)/gi;
    while ((d = depField.exec(block)) !== null) refs.push(...(d[1].match(/(?:T|TASK)-\d+/gi) || []));

    const deps = new Set();
    for (const r of refs) {
      const n = normTaskId(r);
      if (n === heads[i].norm) continue; // self-reference — ignore
      if (idByNorm.has(n)) deps.add(idByNorm.get(n));
      else danglingRefs.add(r);
    }
    graph.set(heads[i].id, deps);
  }
  return { graph, danglingRefs };
}

/**
 * Split tasks.md into per-task blocks: [{ id, header, block }].
 * A block spans from its header to the next task header (or EOF).
 */
function extractTaskBlocks(content) {
  const headerRe = /^#{2,4}\s*((?:T|TASK)-\d+)[^\n]*/gim;
  const heads = [];
  let m;
  while ((m = headerRe.exec(content)) !== null) {
    heads.push({ id: m[1], header: m[0], index: m.index });
  }
  // Level-2 section boundaries (## …, not ###/####) — a task block must NOT bleed past
  // one, else trailing "## Dependency Graph"/"## Execution Schedule" recaps (which
  // mention [GATE]/[RISKY]/[DEPENDS]) contaminate the last task's block.
  const sectionRe = /^##\s+(?!#)/gim;
  const sections = [];
  while ((m = sectionRe.exec(content)) !== null) sections.push(m.index);
  return heads.map((h, i) => {
    let end = i + 1 < heads.length ? heads[i + 1].index : content.length;
    const sec = sections.find(s => s > h.index && s < end);
    if (sec !== undefined) end = sec;
    return { id: h.id, header: h.header, block: content.slice(h.index, end) };
  });
}

/**
 * Detect a cycle in the dependency graph via DFS coloring.
 * Returns the cycle path (array of displayIds) or null.
 */
function findTaskCycle(graph) {
  const color = new Map(); // 0=white, 1=gray, 2=black
  for (const k of graph.keys()) color.set(k, 0);
  const stack = [];
  let found = null;
  function dfs(u) {
    color.set(u, 1);
    stack.push(u);
    for (const v of graph.get(u) || []) {
      if (color.get(v) === 1) {
        found = stack.slice(stack.indexOf(v)).concat(v);
        return true;
      }
      if (color.get(v) === 0 && dfs(v)) return true;
    }
    stack.pop();
    color.set(u, 2);
    return false;
  }
  for (const k of graph.keys()) {
    if (color.get(k) === 0 && dfs(k)) break;
  }
  return found;
}

/**
 * Validate tasks.md structure
 */
function validateTasks(content, filePath) {
  const issues = [];
  const warnings = [];
  const ok = [];

  // Check for task entries (accepts both T-001 and TASK-01 conventions)
  const taskMatches = content.match(/###\s*(?:T|TASK)-\d+/gi) || [];
  if (taskMatches.length > 0) {
    ok.push(`${taskMatches.length} task(s) found`);
  } else {
    issues.push('No T-xxx task entries found');
  }

  // Check annotations — must be EXACTLY 1 entrypoint. Count on task header lines
  // only, so an Execution Schedule recap mentioning [ENTRYPOINT] doesn't inflate it.
  const taskHeaderLines = content.match(/^#{2,4}\s*(?:T|TASK)-\d+[^\n]*/gim) || [];
  const entrypointCount = taskHeaderLines.filter(h => /\[ENTRYPOINT\]/i.test(h)).length;
  if (entrypointCount === 1) {
    ok.push('[ENTRYPOINT] annotation found (exactly 1)');
  } else if (entrypointCount > 1) {
    issues.push(`Found ${entrypointCount} [ENTRYPOINT] annotations — task list must have exactly 1 entrypoint`);
  } else if (taskMatches.length > 0) {
    issues.push('Missing [ENTRYPOINT] — task list must have exactly 1 entrypoint');
  }

  // Check for REQ traceability
  const reqRefs = content.match(/REQ-[A-Z]\d+/g) || [];
  const uniqueReqs = [...new Set(reqRefs)];
  // Acceptance Criterion references (AC-NN) — for spec↔task AC coverage cross-check
  const acRefs = [...new Set(content.match(/\bAC-\d+\b/g) || [])];
  if (uniqueReqs.length > 0) {
    ok.push('REQ traceability found in tasks');
  } else if (taskMatches.length > 0) {
    issues.push('Tasks missing REQ-xxx traceability — each task must trace to a requirement');
  }

  // Check for dependency declarations
  const hasDeps = /\[DEPENDS/i.test(content);
  if (hasDeps) {
    ok.push('Dependency declarations found');
  } else if (taskMatches.length > 2) {
    warnings.push('No [DEPENDS] annotations — consider declaring task dependencies');
  }

  // Dependency graph integrity — cycles + dangling references
  const { graph, danglingRefs } = parseTaskGraph(content);
  const cycle = findTaskCycle(graph);
  if (cycle) {
    issues.push(`Circular dependency detected: ${cycle.join(' → ')}`);
  } else if (hasDeps) {
    ok.push('No circular dependencies');
  }
  if (danglingRefs.size > 0) {
    warnings.push(`[DEPENDS] references unknown task(s): ${[...danglingRefs].join(', ')}`);
  }

  // CLARIFY — tasks needing human clarification before implementation
  const clarifyCount = (content.match(/\[CLARIFY\]/gi) || []).length;
  if (clarifyCount > 0) {
    warnings.push(`${clarifyCount} task(s) gắn [CLARIFY] — cần làm rõ với human trước khi implement`);
  }

  // Task Type tags (change surface)
  const typeTags = content.match(/\[(UI|API|DB|LOGIC|REFACTOR|TEST)\]/gi) || [];
  if (typeTags.length > 0) {
    const kinds = new Set(typeTags.map(t => t.toUpperCase()));
    ok.push(`Task Type tags found (${kinds.size} type(s))`);
  } else if (taskMatches.length > 0) {
    warnings.push('No Task Type tags ([UI]/[API]/[DB]/[LOGIC]/[REFACTOR]/[TEST]) — tag each task by change surface');
  }

  // Change specificity (symbol + before→after) — only when tasks involve modifying existing code
  const looksLikeModify = /\b(sửa|modify|update|refactor|ALTER)\b/i.test(content);
  if (taskMatches.length > 0 && looksLikeModify && !/vị\s*trí|hiện\s*trạng|symbol/i.test(content)) {
    warnings.push('Tasks lack change detail — add "Vị trí (symbol)" + "Hiện trạng → Mong muốn" for modify tasks');
  }

  // Use case traceability
  const ucRefs = content.match(/UC-\d+/g) || [];
  if (ucRefs.length > 0) {
    ok.push(`Tasks trace to ${new Set(ucRefs).size} use case(s)`);
  } else if (taskMatches.length > 0) {
    warnings.push('Tasks missing UC-xx mapping — link each task to a use case');
  }

  // ── Per-task completeness (warnings) — each task block must be self-sufficient
  // so Implement Agent never has to ask back. Kept as warnings (not issues) so a
  // slightly incomplete task doesn't hard-fail the pipeline.
  const blocks = extractTaskBlocks(content);
  const TYPE_RE = /\[(UI|API|DB|LOGIC|REFACTOR|TEST)\]/i;
  const CODE_TYPE_RE = /\[(UI|API|DB|LOGIC)\]/i; // code-touching tasks should drive TDD
  const missing = { type: [], complexity: [], doneWhen: [], tdd: [], req: [], clarify: [], gate: [], risky: [] };
  const tier = { S: 0, M: 0, L: 0 };
  const taskFiles = new Set();
  let points = 0;
  for (const b of blocks) {
    if (!TYPE_RE.test(b.block)) missing.type.push(b.id);

    // Annotation-completeness — enforce the rules the skills declare
    if (/\[CLARIFY\]/i.test(b.block) && !/câu\s*hỏi\s*mở|open\s*question/i.test(b.block)) missing.clarify.push(b.id);
    if (/\[GATE\]/i.test(b.block) && !/gate\s*condition|điều\s*kiện.*gate/i.test(b.block)) missing.gate.push(b.id);
    if (/\[RISKY\]/i.test(b.block) && !/fallback|\brisk\b|rủi\s*ro/i.test(b.block)) missing.risky.push(b.id);

    // Collect declared files (for plan↔tasks consistency)
    const ff = b.block.match(/\*\*\s*Files?\s*\*\*\s*:?\s*([^\n]+)/i);
    if (ff) {
      for (const raw of (ff[1].match(/`([^`]+)`/g) || [])) {
        const k = raw.replace(/`/g, '').trim();
        if (k) taskFiles.add(k);
      }
    }

    const cm = b.block.match(/\*\*\s*Complexity\s*\*\*\s*:?\s*([SML])\b/i);
    if (cm) {
      const t = cm[1].toUpperCase();
      tier[t] += 1;
      points += t === 'S' ? 1 : t === 'M' ? 2 : 4;
    } else {
      missing.complexity.push(b.id);
    }

    if (!/done\s*khi|done\s*when/i.test(b.block)) missing.doneWhen.push(b.id);
    if (!/REQ-[A-Z]\d+/.test(b.block)) missing.req.push(b.id);
    // TDD checklist expected only on code-touching tasks (not pure [TEST]/[REFACTOR])
    if (CODE_TYPE_RE.test(b.block) && !/\bTDD\b/i.test(b.block)) missing.tdd.push(b.id);
  }
  if (blocks.length > 0) {
    if (missing.type.length) warnings.push(`Task thiếu Task Type: ${missing.type.join(', ')}`);
    if (missing.complexity.length) warnings.push(`Task thiếu Complexity (S/M/L): ${missing.complexity.join(', ')}`);
    if (missing.doneWhen.length) warnings.push(`Task thiếu "Done khi" (bám AC spec §4, không chỉ test pass): ${missing.doneWhen.join(', ')}`);
    if (missing.tdd.length) warnings.push(`Task code thiếu block TDD (Red→Green): ${missing.tdd.join(', ')}`);
    if (uniqueReqs.length > 0 && missing.req.length) warnings.push(`Task thiếu REQ mapping: ${missing.req.join(', ')}`);
    if (missing.clarify.length) warnings.push(`[CLARIFY] thiếu "Câu hỏi mở": ${missing.clarify.join(', ')}`);
    if (missing.gate.length) warnings.push(`[GATE] thiếu "Gate condition": ${missing.gate.join(', ')}`);
    if (missing.risky.length) warnings.push(`[RISKY] thiếu "Fallback/Risk": ${missing.risky.join(', ')}`);

    // Sizing — quy đổi S=1/M=2/L=4 để biết khi nào nên tách milestone
    if (points > 0) {
      ok.push(`Sizing: Σ ${points} điểm (S:${tier.S} · M:${tier.M} · L:${tier.L})`);
      if (points > 24 || blocks.length > 20) {
        warnings.push(`Quy mô lớn (Σ ${points} điểm / ${blocks.length} task) — cân nhắc tách thành nhiều phase/milestone`);
      }
    }
  }

  // ── Fake [PARALLEL] — two parallel tasks editing the same file must be sequential
  const parallelBlocks = blocks.filter(b => /\[PARALLEL\]/i.test(b.block));
  const fileToTasks = new Map();
  for (const b of parallelBlocks) {
    const fileField = b.block.match(/\*\*\s*Files?\s*\*\*\s*:?\s*([^\n]+)/i);
    if (!fileField) continue;
    const paths = fileField[1].match(/`([^`]+)`/g) || [];
    for (const raw of paths) {
      const key = raw.replace(/`/g, '').trim();
      if (!key) continue;
      if (!fileToTasks.has(key)) fileToTasks.set(key, new Set());
      fileToTasks.get(key).add(b.id);
    }
  }
  for (const [file, ids] of fileToTasks) {
    if (ids.size > 1) {
      warnings.push(`Fake [PARALLEL]: ${[...ids].join(', ')} cùng sửa \`${file}\` — nên chạy tuần tự`);
    }
  }

  return { issues, warnings, ok, taskCount: taskMatches.length, reqs: uniqueReqs, acs: acRefs, files: [...taskFiles] };
}

/**
 * Validate test-cases.md structure
 */
function validateTestCases(content, filePath) {
  const issues = [];
  const warnings = [];
  const ok = [];

  // Check for TC entries
  const tcMatches = content.match(/###\s*TC-/g) || [];
  if (tcMatches.length > 0) {
    ok.push(`${tcMatches.length} test case(s) found`);
  } else {
    issues.push('No TC-xxx test case entries found');
  }

  // Coverage matrix — chấp nhận biến thể heading: "Coverage Matrix", "Test Matrix",
  // hoặc tiếng Việt "Ma trận truy vết" (khớp test-cases-template.md §1).
  if (/coverage\s*matrix|test\s*matrix|ma\s*trận\s*truy\s*vết/i.test(content)) {
    ok.push('Coverage matrix found');
  } else if (tcMatches.length > 0) {
    warnings.push('No Coverage Matrix section — add one at the top of test-cases.md');
  }

  // Check for REQ traceability
  const reqRefs = content.match(/REQ-[A-Z]\d+/g) || [];
  const uniqueReqRefs = [...new Set(reqRefs)];
  if (uniqueReqRefs.length > 0) {
    ok.push(`Test cases trace to ${uniqueReqRefs.length} unique REQ(s)`);
  } else if (tcMatches.length > 0) {
    issues.push('Test cases missing REQ-xxx traceability');
  }

  // Acceptance Criterion (AC-NN) traceability — enable AC↔TC coverage cross-check.
  // Structural only: presence of the AC id, NOT whether the TC truly verifies it (Master Check owns that).
  const acRefs = [...new Set(content.match(/\bAC-\d+\b/g) || [])];
  if (acRefs.length > 0) {
    ok.push(`Test cases trace to ${acRefs.length} unique AC-NN`);
  } else if (tcMatches.length > 0) {
    warnings.push('Test cases thiếu mã AC-NN — thêm cột/field AC để cross-check mỗi AC (spec §4) có ≥1 TC');
  }

  // Priority check
  if (/P1|P2|P3|priority/i.test(content)) {
    ok.push('Priority assignments found');
  } else if (tcMatches.length > 0) {
    warnings.push('No priority assignments (P1/P2/P3) found on test cases');
  }

  return { issues, warnings, ok, tcCount: tcMatches.length, reqs: uniqueReqRefs, acs: acRefs };
}

/**
 * Cross-validate spec REQs vs test-cases coverage
 */
function crossValidateReqCoverage(specResult, testResult) {
  if (!specResult || !testResult) return null;

  const specReqs = specResult.reqs || [];
  const testReqs = testResult.reqs || [];

  const covered = specReqs.filter(r => testReqs.includes(r));
  const uncovered = specReqs.filter(r => !testReqs.includes(r));

  return {
    total: specReqs.length,
    covered: covered.length,
    uncovered,
    percentage: specReqs.length > 0 ? Math.round((covered.length / specReqs.length) * 100) : 0,
  };
}

/**
 * Cross-validate spec REQs vs tasks coverage — every REQ must have ≥1 task.
 */
function crossValidateTaskCoverage(specResult, tasksResult) {
  if (!specResult || !tasksResult) return null;

  const specReqs = specResult.reqs || [];
  const taskReqs = tasksResult.reqs || [];

  const covered = specReqs.filter(r => taskReqs.includes(r));
  const uncovered = specReqs.filter(r => !taskReqs.includes(r));

  return {
    total: specReqs.length,
    covered: covered.length,
    uncovered,
    percentage: specReqs.length > 0 ? Math.round((covered.length / specReqs.length) * 100) : 0,
  };
}

/**
 * Cross-validate: spec declares NFR ("Yêu cầu đặc biệt") but plan has no NFR section.
 * Returns { warn: boolean }.
 */
function crossValidateNfr(specResult, planResult) {
  if (!specResult || !planResult) return null;
  return { warn: Boolean(specResult.hasSpecialReqs) && !planResult.hasNfr };
}

/**
 * Cross-validate: every spec acceptance criterion (AC-NN) is referenced by ≥1 task.
 * Returns null when the spec defines no AC IDs (feature is opt-in, no false alarms).
 */
function crossValidateAcCoverage(specResult, tasksResult) {
  if (!specResult || !tasksResult) return null;
  const specAcs = specResult.acs || [];
  if (specAcs.length === 0) return null; // AC IDs optional — only check when present
  const taskAcs = tasksResult.acs || [];
  const covered = specAcs.filter(a => taskAcs.includes(a));
  const uncovered = specAcs.filter(a => !taskAcs.includes(a));
  return {
    total: specAcs.length,
    covered: covered.length,
    uncovered,
    percentage: Math.round((covered.length / specAcs.length) * 100),
  };
}

/**
 * Cross-validate: every spec acceptance criterion (AC-NN) is verified by ≥1 test case.
 * Mirror of crossValidateAcCoverage but for test-cases.md. Opt-in: returns null when the
 * spec defines no AC IDs (no false alarms on AC-less specs).
 */
function crossValidateTestAcCoverage(specResult, testResult) {
  if (!specResult || !testResult) return null;
  const specAcs = specResult.acs || [];
  if (specAcs.length === 0) return null; // AC IDs optional — only check when present
  const testAcs = testResult.acs || [];
  const covered = specAcs.filter(a => testAcs.includes(a));
  const uncovered = specAcs.filter(a => !testAcs.includes(a));
  return {
    total: specAcs.length,
    covered: covered.length,
    uncovered,
    percentage: Math.round((covered.length / specAcs.length) * 100),
  };
}

/**
 * Cross-validate: every spec REQ appears in plan.md (spec→plan coverage).
 * Returns null when spec has no REQs.
 */
function crossValidatePlanReqCoverage(specResult, planResult) {
  if (!specResult || !planResult) return null;
  const specReqs = specResult.reqs || [];
  if (specReqs.length === 0) return null;
  const planReqs = planResult.reqs || [];
  const uncovered = specReqs.filter(r => !planReqs.includes(r));
  return {
    total: specReqs.length,
    covered: specReqs.length - uncovered.length,
    uncovered,
    percentage: Math.round(((specReqs.length - uncovered.length) / specReqs.length) * 100),
  };
}

/**
 * Dangling refs: tasks cite a REQ/AC id that does NOT exist in the spec
 * (typo / copy-paste drift). Symmetric to the dangling-[DEPENDS] check.
 */
function crossValidateDanglingRefs(specResult, tasksResult) {
  if (!specResult || !tasksResult) return null;
  const specReqs = new Set(specResult.reqs || []);
  const specAcs = new Set(specResult.acs || []);
  return {
    danglingReqs: (tasksResult.reqs || []).filter(r => specReqs.size > 0 && !specReqs.has(r)),
    danglingAcs: (tasksResult.acs || []).filter(a => specAcs.size > 0 && !specAcs.has(a)),
  };
}

/**
 * Plan ↔ Tasks consistency — the two artifacts most likely to drift from each other.
 * Flags REQ in plan not covered by any task, and task files not planned in plan §6.
 * A plan dir token ("a/b/") covers any file beneath it.
 */
function crossValidatePlanTasks(planResult, tasksResult) {
  if (!planResult || !tasksResult) return null;
  const planReqs = new Set(planResult.reqs || []);
  const taskReqs = new Set(tasksResult.reqs || []);
  const planFiles = planResult.files || [];
  const filesNotInPlan = (tasksResult.files || []).filter(f => {
    if (planFiles.length === 0) return false; // plan has no parseable paths → skip
    if (planFiles.includes(f)) return false;
    if (planFiles.some(p => p.endsWith('/') && f.startsWith(p))) return false;
    return true;
  });
  return {
    reqOnlyInPlan: [...planReqs].filter(r => !taskReqs.has(r)),
    reqOnlyInTasks: [...taskReqs].filter(r => !planReqs.has(r)),
    filesNotInPlan,
  };
}

// ════════════════════════════════════════════════════════════
// MAIN COMMAND
// ════════════════════════════════════════════════════════════

module.exports = function (program) {
  program
    .command('validate')
    .description('Validate V-Flow artifact structure and quality')
    .argument('[feature]', 'Feature name to validate (default: all features)')
    .option('--spec-only', 'Only validate spec.md')
    .option('--strict', 'Treat warnings as errors — dùng cho CI / cổng trước-implement để chặn lỗi traceability (REQ/AC/task coverage)')
    .option('--quiet', 'Chỉ hiện issue + warning (ẩn dòng "check passed")')
    .option('--constitution', 'Validate source code against constitution.md [LINT:xxx] rules')
    .option('--src <dir>', 'Source directory for constitution lint (default: src/)')
    .option('--test-results <file>', 'JUnit XML — bật AC-PASS gate: mỗi AC-NN (spec) phải có ≥1 test PASS tham chiếu')
    .option('--module-cards [module]', 'Lint module card (.v-flow/modules/) — cấu trúc + ngôn ngữ business-quiz (cấm dính code). Bỏ trống = tất cả; truyền tên = chỉ module đó (fallback domain-<tên>)')
    .action(withErrorHandler(async (featureName, options) => {
      const t = createT();
      const projectRoot = process.cwd();
      requireInit(projectRoot, isInitialized);

      const cfg = readValidateConfig(projectRoot);
      let suppressedTotal = 0;

      console.log(chalk.cyan.bold('\n🔍 V Flow — Validate\n'));

      // ════════════════════════════════════════════════════════
      // Constitution Lint (if --constitution flag)
      // ════════════════════════════════════════════════════════
      if (options.constitution) {
        const constitutionPath = path.join(getVFlowDir(projectRoot), 'constitution.md');
        if (!fs.existsSync(constitutionPath)) {
          printError('constitution.md not found — run v-flow init first');
          process.exit(1);
        }

        const content = await fs.readFile(constitutionPath, 'utf8');
        console.log(chalk.white.bold('📜 Constitution Lint\n'));
        console.log(chalk.dim('   Parsing constitution.md for [LINT:xxx] rules...\n'));

        const { rules, parseErrors } = parseConstitution(content);

        // Report parse errors
        for (const err of parseErrors) {
          printWarn(err);
        }

        if (rules.length === 0) {
          console.log(chalk.dim('   No [LINT:xxx] rules found in constitution.md.'));
          console.log(chalk.dim('   Add rules like: - [LINT:naming] Files must use kebab-case'));
          console.log(chalk.dim('   See: learn/09-constitution-lint.md\n'));
          if (!featureName && !options.specOnly) return;
        } else {
          console.log(chalk.white(`   Found ${rules.length} lintable rule(s):\n`));
          for (const rule of rules) {
            const sevIcon = rule.severity === 'critical' ? '🔴' : rule.severity === 'error' ? '🟡' : '⚪';
            console.log(chalk.dim(`   ${sevIcon} [${rule.id}] [${rule.category}] ${rule.text}`));
          }
          console.log('');

          // Run checks
          console.log(chalk.dim('   Scanning project...\n'));
          const lintOptions = {
            srcDir: options.src ? path.resolve(projectRoot, options.src) : undefined,
            verbose: true,
          };
          const { violations, stats } = await runConstitutionLint(rules, projectRoot, lintOptions);

          // Report violations
          if (violations.length === 0) {
            printOk(`All ${stats.total} constitution rules passed`);
          } else {
            for (const v of violations) {
              console.log(`      ${formatViolation(v)}`);
            }
            console.log('');
          }

          // Summary
          console.log(chalk.cyan.bold('   ── Constitution Lint Summary ──\n'));
          if (stats.critical > 0) {
            console.log(chalk.red(`   🔴 ${stats.critical} critical violation(s)`));
          }
          if (stats.errors > 0) {
            console.log(chalk.red(`   ❌ ${stats.errors} error(s)`));
          }
          if (stats.warnings > 0) {
            console.log(chalk.yellow(`   ⚠️  ${stats.warnings} warning(s)`));
          }
          console.log(chalk.green(`   ✅ ${stats.passed}/${stats.total} rule(s) passed`));
          const compliancePercent = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 100;
          console.log(chalk.dim(`   📊 Constitution compliance: ${compliancePercent}%\n`));

          if (stats.critical > 0) {
            printError('Critical constitution violations found — CI should fail');
            if (!featureName && !options.specOnly) {
              process.exit(1);
            }
          }
        }

        // If only --constitution was requested (no feature name), stop here
        if (!featureName && !options.specOnly) return;
        console.log(''); // separator
      }

      // ════════════════════════════════════════════════════════
      // Module Card Lint (if --module-cards flag)
      // Structural + business-language lint for Understand-tier cards.
      // Self-contained like the constitution block; returns early when run
      // standalone (no feature name).
      // ════════════════════════════════════════════════════════
      if (options.moduleCards) {
        const modulesDir = path.join(getVFlowDir(projectRoot), 'modules');
        console.log(chalk.white.bold('🗂️  Module Card Lint\n'));

        const allCardDirs = fs.existsSync(modulesDir)
          ? (await fs.readdir(modulesDir, { withFileTypes: true }))
              .filter((d) => d.isDirectory())
              .map((d) => d.name)
              .sort()
          : [];

        // `--module-cards <name>` lints just that card (fallback to domain-<name>,
        // same resolution as score-card / dev-quiz); bare `--module-cards` lints all.
        const targetModule = typeof options.moduleCards === 'string' ? options.moduleCards : null;
        let cardDirs = allCardDirs;
        if (targetModule) {
          cardDirs = allCardDirs.filter((c) => c === targetModule || c === `domain-${targetModule}`);
          if (cardDirs.length === 0) {
            printError(`Không tìm thấy module card "${targetModule}" trong .v-flow/modules/. Có: ${allCardDirs.length ? allCardDirs.join(', ') : '(chưa có card nào)'}`);
            process.exit(1);
          }
        }

        if (cardDirs.length === 0) {
          console.log(chalk.dim('   Chưa có module card nào (.v-flow/modules/) — chạy /v.understand trước.\n'));
        } else {
          let cardIssues = 0;
          let cardWarnings = 0;

          for (const card of cardDirs) {
            const cardPath = path.join(modulesDir, card);
            const readCardFile = (f) => {
              const p = path.join(cardPath, f);
              return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
            };

            const structResult = validateModuleCardStructure(card, readCardFile);
            printArtifactResults(card, structResult, options.quiet);
            cardIssues += structResult.issues.length;
            cardWarnings += structResult.warnings.length;

            const quizContent = readCardFile('business-quiz.md');
            if (quizContent != null) {
              const quizResult = lintBusinessQuiz(quizContent);
              printArtifactResults(`${card}/business-quiz.md`, quizResult, options.quiet);
              cardIssues += quizResult.issues.length;
              cardWarnings += quizResult.warnings.length;
            }
          }

          console.log(chalk.cyan.bold('\n   ── Module Card Lint Summary ──\n'));
          console.log(chalk.dim(`   📦 ${cardDirs.length} module card`));
          if (cardIssues > 0) console.log(chalk.red(`   ❌ ${cardIssues} issue`));
          if (cardWarnings > 0) console.log(chalk.yellow(`   ⚠️  ${cardWarnings} warning`));
          if (cardIssues === 0 && cardWarnings === 0) console.log(chalk.green('   ✅ Tất cả module card đạt'));
          console.log('');

          const cardFails = cardIssues > 0 || (options.strict && cardWarnings > 0);
          if (cardFails && !featureName && !options.specOnly) {
            printError(options.strict
              ? 'Module card có issue/warning — --strict bật → fail.'
              : 'Module card có issue → fail.');
            process.exit(1);
          }
        }

        if (!featureName && !options.specOnly) return;
        console.log('');
      }

      // Parse JUnit test results once (opt-in AC-PASS gate). An objective runner
      // fact — not semantic judgment — so it belongs in the deterministic validator.
      let junitCases = null;
      if (options.testResults) {
        const trPath = path.resolve(projectRoot, options.testResults);
        if (!fs.existsSync(trPath)) {
          printError(`--test-results: file không tồn tại: ${options.testResults}`);
          process.exit(1);
        }
        junitCases = parseJUnitResults(await fs.readFile(trPath, 'utf8'));
        console.log(chalk.dim(`   🧪 Đã đọc ${junitCases.length} testcase từ ${options.testResults}\n`));
      }

      const features = featureName
        ? [featureName]
        : await listFeatures(projectRoot);

      if (features.length === 0) {
        console.log(chalk.dim('   No features found. Create one with: v-flow feature create <name>'));
        return;
      }

      let totalIssues = 0;
      let totalWarnings = 0;
      let totalOk = 0;
      let legacyWarnings = 0;

      for (const feature of features) {
        if (cfg.ignoreFeatures.includes(feature)) {
          console.log(chalk.dim(`📋 Feature: ${feature} — bỏ qua (ignoreFeatures)\n`));
          continue;
        }
        console.log(chalk.white.bold(`📋 Feature: ${feature}\n`));

        const featureDir = path.join(getVFlowDir(projectRoot), 'features', feature);
        if (!fs.existsSync(featureDir)) {
          printError(`Feature directory not found: ${feature}`);
          totalIssues++;
          continue;
        }

        // Schema-version gate: legacy features' new-schema warnings stay advisory.
        const warnAtFeatureStart = totalWarnings;
        const featureSchemaVer = readFeatureSchemaVersion(featureDir);
        const isLegacy = schemaIsLegacy(featureSchemaVer);
        const isLite = isLiteProfile(readPipelineType(featureDir));

        let specResult = null;
        let planResult = null;
        let tasksResult = null;
        let testResult = null;

        // Validate spec.md
        const specPath = path.join(featureDir, 'spec.md');
        if (fs.existsSync(specPath)) {
          const content = await fs.readFile(specPath, 'utf8');
          specResult = validateSpec(content, specPath);
          suppressedTotal += applyIgnore(specResult, cfg.ignore);
          printArtifactResults('spec.md', specResult, options.quiet);
          totalIssues += specResult.issues.length;
          totalWarnings += specResult.warnings.length;
          totalOk += specResult.ok.length;
        } else {
          printWarn('spec.md not found — run /v.specify first');
          totalWarnings++;
        }

        if (options.specOnly) continue;

        // Validate plan.md
        const planPath = path.join(featureDir, 'plan.md');
        if (fs.existsSync(planPath)) {
          const content = await fs.readFile(planPath, 'utf8');
          planResult = validatePlan(content, planPath, { lite: isLite });
          suppressedTotal += applyIgnore(planResult, cfg.ignore);
          printArtifactResults('plan.md', planResult, options.quiet);
          totalIssues += planResult.issues.length;
          totalWarnings += planResult.warnings.length;
          totalOk += planResult.ok.length;
        }

        // Validate tasks.md
        const tasksPath = path.join(featureDir, 'tasks.md');
        if (fs.existsSync(tasksPath)) {
          const content = await fs.readFile(tasksPath, 'utf8');
          tasksResult = validateTasks(content, tasksPath);
          suppressedTotal += applyIgnore(tasksResult, cfg.ignore);
          printArtifactResults('tasks.md', tasksResult, options.quiet);
          totalIssues += tasksResult.issues.length;
          totalWarnings += tasksResult.warnings.length;
          totalOk += tasksResult.ok.length;
        }

        // Validate test-cases.md
        const testPath = path.join(featureDir, 'test-cases.md');
        if (fs.existsSync(testPath)) {
          const content = await fs.readFile(testPath, 'utf8');
          testResult = validateTestCases(content, testPath);
          suppressedTotal += applyIgnore(testResult, cfg.ignore);
          printArtifactResults('test-cases.md', testResult, options.quiet);
          totalIssues += testResult.issues.length;
          totalWarnings += testResult.warnings.length;
          totalOk += testResult.ok.length;
        }

        // Cross-validate REQ → task coverage (every spec REQ has ≥1 task)
        const taskCoverage = crossValidateTaskCoverage(specResult, tasksResult);
        if (taskCoverage && taskCoverage.total > 0) {
          console.log(chalk.white.bold(`\n   📊 Task REQ Coverage: ${taskCoverage.covered}/${taskCoverage.total} (${taskCoverage.percentage}%)`));
          if (taskCoverage.uncovered.length > 0) {
            printWarn(`REQ chưa có task nào: ${taskCoverage.uncovered.join(', ')}`);
            totalWarnings += taskCoverage.uncovered.length;
          } else {
            printOk('100% REQ có task');
            totalOk++;
          }
        }

        // Cross-validate AC → task coverage (every spec AC-NN has ≥1 task)
        const acCoverage = crossValidateAcCoverage(specResult, tasksResult);
        if (acCoverage) {
          console.log(chalk.white.bold(`\n   📊 AC Coverage: ${acCoverage.covered}/${acCoverage.total} (${acCoverage.percentage}%)`));
          if (acCoverage.uncovered.length > 0) {
            printWarn(`AC chưa có task nào phủ: ${acCoverage.uncovered.join(', ')}`);
            totalWarnings += acCoverage.uncovered.length;
          } else {
            printOk('100% AC có task');
            totalOk++;
          }
        }

        // Cross-validate REQ → plan coverage (every spec REQ appears in plan.md)
        const planReqCov = crossValidatePlanReqCoverage(specResult, planResult);
        if (planReqCov && planReqCov.uncovered.length > 0) {
          printWarn(`REQ chưa xuất hiện trong plan.md: ${planReqCov.uncovered.join(', ')}`);
          totalWarnings += planReqCov.uncovered.length;
        }

        // Dangling refs — tasks cite REQ/AC not present in the spec
        const dangling = crossValidateDanglingRefs(specResult, tasksResult);
        if (dangling && dangling.danglingReqs.length > 0) {
          printWarn(`Task tham chiếu REQ không có trong spec: ${dangling.danglingReqs.join(', ')}`);
          totalWarnings += dangling.danglingReqs.length;
        }
        if (dangling && dangling.danglingAcs.length > 0) {
          printWarn(`Task tham chiếu AC không có trong spec: ${dangling.danglingAcs.join(', ')}`);
          totalWarnings += dangling.danglingAcs.length;
        }

        // Plan ↔ Tasks consistency — REQ drift + task file not planned
        const planTasks = crossValidatePlanTasks(planResult, tasksResult);
        if (planTasks && planTasks.reqOnlyInPlan.length > 0) {
          printWarn(`REQ có trong plan nhưng không task nào phủ: ${planTasks.reqOnlyInPlan.join(', ')}`);
          totalWarnings += planTasks.reqOnlyInPlan.length;
        }
        if (planTasks && planTasks.filesNotInPlan.length > 0) {
          printWarn(`Task đụng file không có trong plan §6 (File Changes): ${planTasks.filesNotInPlan.join(', ')}`);
          totalWarnings += planTasks.filesNotInPlan.length;
        }

        // Cross-validate NFR: spec has special requirements but plan lacks an NFR section
        const nfr = crossValidateNfr(specResult, planResult);
        if (!isLite && nfr && nfr.warn) {
          printWarn('Spec có "Yêu cầu đặc biệt" (NFR) nhưng plan thiếu mục NFR (§10) — NFR dễ rơi rụng khi implement');
          totalWarnings++;
        }

        // Cross-validate REQ coverage
        const coverage = crossValidateReqCoverage(specResult, testResult);
        if (coverage) {
          console.log(chalk.white.bold(`\n   📊 REQ Coverage: ${coverage.covered}/${coverage.total} (${coverage.percentage}%)`));
          if (coverage.uncovered.length > 0) {
            printWarn(`Uncovered REQs: ${coverage.uncovered.join(', ')}`);
            totalWarnings += coverage.uncovered.length;
          } else {
            printOk('100% REQ coverage in test cases');
            totalOk++;
          }
        }

        // Cross-validate AC → test coverage (every spec AC-NN verified by ≥1 TC)
        const testAcCoverage = crossValidateTestAcCoverage(specResult, testResult);
        if (testAcCoverage) {
          console.log(chalk.white.bold(`\n   📊 AC Coverage (tests): ${testAcCoverage.covered}/${testAcCoverage.total} (${testAcCoverage.percentage}%)`));
          if (testAcCoverage.uncovered.length > 0) {
            printWarn(`AC chưa có test nào verify: ${testAcCoverage.uncovered.join(', ')}`);
            totalWarnings += testAcCoverage.uncovered.length;
          } else {
            printOk('100% AC có test');
            totalOk++;
          }
        }

        // AC-PASS gate — every spec AC-NN backed by a PASSING test (opt-in --test-results).
        // This is the spec↔code "living-spec" check: coverage above is on-paper; this
        // reaches the real runner and blocks when an AC has no passing test behind it.
        if (junitCases && specResult && (specResult.acs || []).length > 0) {
          const gate = checkAcTestPass(specResult.acs, junitCases);
          console.log(chalk.white.bold(`\n   🚦 AC-PASS Gate: ${gate.passed.length}/${gate.total} AC có test PASS`));
          if (gate.failing.length > 0) {
            printError(`AC có test nhưng FAIL/skip — chưa thỏa: ${gate.failing.join(', ')}`);
            totalIssues += gate.failing.length; // hard issue — always blocks
          }
          if (gate.missing.length > 0) {
            printWarn(`AC chưa có test PASS nào tham chiếu (đặt tên test chứa AC-NN): ${gate.missing.join(', ')}`);
            totalWarnings += gate.missing.length; // blocks under --strict
          }
          if (gate.failing.length === 0 && gate.missing.length === 0) {
            printOk('100% AC có test PASS');
            totalOk++;
          }
        }

        // Legacy schema: demote this feature's new-schema warnings to advisory (no --strict gate)
        if (isLegacy) {
          const featWarn = totalWarnings - warnAtFeatureStart;
          if (featWarn > 0) {
            totalWarnings -= featWarn;
            legacyWarnings += featWarn;
            console.log(chalk.dim(`   📦 Schema cũ (${featureSchemaVer || 'chưa stamp'} < ${SCHEMA_VERSION}): ${featWarn} cảnh báo schema-mới → tham khảo, KHÔNG chặn --strict. Migrate: bổ sung field thiếu rồi đặt schema_version: "${SCHEMA_VERSION}" trong .flow-state.yaml.`));
          }
        }

        // Slice gate (B.0c) — feature with an active variant: slice rules under profile `strict`.
        // Errors block; warnings are advisory (the profile already decides what blocks).
        if (options.strict) {
          const gate = sliceGate(projectRoot, featureDir);
          if (gate) {
            console.log(chalk.white.bold(`\n   ✂️  Slice plan: ${gate.variant}${gate.stale ? ' (stale)' : ''} — ${gate.evaluation.errorCount} lỗi, ${gate.evaluation.warnCount} cảnh báo`));
            if (gate.stale) { printError(`Variant ${gate.variant} sinh từ graph cũ — chạy v-flow slice impact ${feature}`); totalIssues++; }
            for (const v of gate.evaluation.violations) {
              const line = `${v.rule}${v.slice ? ` (${v.slice})` : ''}: ${v.message}`;
              if (v.severity === 'error') { printError(line); totalIssues++; } else { printDim(`⚠ ${line}`); }
            }
            if (!gate.stale && gate.evaluation.errorCount === 0) { printOk('Slice plan qua profile strict'); totalOk++; }
          }
        }

        // Governance gate — risk_tier + required approvals (lightweight; --strict blocks).
        // After the legacy block so it is NOT demoted: governance applies regardless of schema age.
        const flowState = await readFlowState(featureDir);
        const gov = checkGovernance(flowState || {});
        if (gov.tier || gov.warnings.length > 0) {
          console.log(chalk.white.bold(`\n   🛡️  Governance: risk_tier = ${gov.tier || '(chưa khai báo)'}`));
          for (const w of gov.warnings) { printWarn(w); totalWarnings++; }
          for (const o of gov.ok) { printOk(o); totalOk++; }
        }

        console.log('');
      }

      // Final summary
      console.log(chalk.cyan.bold('── Summary ──\n'));

      const total = totalIssues + totalWarnings + totalOk;
      const score = total > 0 ? Math.round((totalOk / total) * 100) : 0;

      if (totalIssues > 0) {
        console.log(chalk.red(`   ❌ ${totalIssues} issue(s) found`));
      }
      if (totalWarnings > 0) {
        console.log(chalk.yellow(`   ⚠️  ${totalWarnings} warning(s)`));
      }
      if (legacyWarnings > 0) {
        console.log(chalk.dim(`   📦 ${legacyWarnings} cảnh báo schema-cũ (tham khảo — migrate + bump schema_version để bật)`));
      }
      if (suppressedTotal > 0) {
        console.log(chalk.dim(`   🔇 ${suppressedTotal} finding(s) ẩn theo .v-flow/validate.config.json`));
      }
      console.log(chalk.green(`   ✅ ${totalOk} check(s) passed`));
      console.log(chalk.dim(`   📊 Quality score: ${score}%\n`));

      // Traceability cross-checks (REQ/AC/task coverage, dangling refs) are warnings by
      // design — they may be transient mid-authoring. Surface --strict so CI / the
      // pre-implement gate actually blocks on them (closes the "soft gate" gap).
      if (!options.strict && totalWarnings > 0) {
        console.log(chalk.dim(`   💡 ${totalWarnings} cảnh báo KHÔNG chặn ở chế độ thường. CI / cổng trước-implement nên chạy: v-flow validate ${featureName || '<feature>'} --strict\n`));
      }

      if (options.strict && (totalIssues > 0 || totalWarnings > 0)) {
        process.exit(1);
      } else if (totalIssues > 0) {
        process.exit(1);
      }
    }));
};

function printArtifactResults(name, result, quiet) {
  const statusIcon = result.issues.length > 0 ? '❌' : result.warnings.length > 0 ? '⚠️ ' : '✅';
  console.log(chalk.white(`   ${statusIcon} ${name}:`));

  if (!quiet) {
    for (const item of result.ok) {
      console.log(chalk.green(`      ✅ ${item}`));
    }
  }
  for (const item of result.warnings) {
    console.log(chalk.yellow(`      ⚠️  ${item}`));
  }
  for (const item of result.issues) {
    console.log(chalk.red(`      ❌ ${item}`));
  }
}

// Expose internal validators for unit testing (does not affect command registration)
module.exports.validateSpec = validateSpec;
module.exports.validatePlan = validatePlan;
module.exports.validateTasks = validateTasks;
module.exports.validateTestCases = validateTestCases;
module.exports.crossValidateReqCoverage = crossValidateReqCoverage;
module.exports.crossValidateTaskCoverage = crossValidateTaskCoverage;
module.exports.crossValidateNfr = crossValidateNfr;
module.exports.crossValidateAcCoverage = crossValidateAcCoverage;
module.exports.crossValidateTestAcCoverage = crossValidateTestAcCoverage;
module.exports.crossValidatePlanReqCoverage = crossValidatePlanReqCoverage;
module.exports.crossValidateDanglingRefs = crossValidateDanglingRefs;
module.exports.crossValidatePlanTasks = crossValidatePlanTasks;
module.exports.schemaIsLegacy = schemaIsLegacy;
module.exports.SCHEMA_VERSION = SCHEMA_VERSION;
module.exports.isLiteProfile = isLiteProfile;
module.exports.applyIgnore = applyIgnore;
