/**
 * Module Card Score — objective tier of the scorecard (Decision 3).
 *
 * Computes the 6-point OBJECTIVE half of a module card's score from facts a
 * machine can re-check. Pure: (cardName, readFile, oracle) → scorecard object.
 * Anyone re-running with the same oracle gets the same number — that IS the proof.
 *
 *   structural (2)  — files/headings/placeholders + quiz language   [no oracle]
 *   grounded   (2)  — BR `Source:` refs resolve to real code        [oracle.symbolExists]
 *   freshness  (1)  — referenced files unchanged since last_verified [oracle.changedSince]
 *   coverage   (1)  — % of module symbols referenced                 [oracle.symbolsOf → full graph]
 *
 * HONEST DEGRADATION: a dimension the oracle can't verify is marked
 * { verified: false, score: 0 } with a reason — never silently counted as a pass.
 * Mode stamp: all verified → none · coverage-only missing → "*" · grounded/
 * freshness also missing (NullOracle) → "†".
 *
 * Subjective half (business/dev correctness, depth) is NOT computed here — it
 * needs human + AI graders (Decision 2/3).
 */

const { validateModuleCardStructure, lintBusinessQuiz, REQUIRED_CARD_FILES, OPTIONAL_CARD_FILES } = require('./module-card-lint');

const ALL_CARD_FILES = [...REQUIRED_CARD_FILES, ...OPTIONAL_CARD_FILES];

function round1(n) {
  return Math.round(n * 10) / 10;
}

/**
 * Extract code references of the form:  Source: `path/file.ext:123`, hàm `funcName`
 * @returns {Array<{file, line, name, raw}>}
 */
function extractRefs(content) {
  const refs = [];
  const re = /Source:\s*`([^`]+)`(?:[^\n]*?hàm\s*`([^`]+)`)?/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    const fileLine = m[1].trim();
    const name = m[2] ? m[2].trim() : null;
    let file = fileLine;
    let line = null;
    const idx = fileLine.lastIndexOf(':');
    if (idx > 0 && /^\d+$/.test(fileLine.slice(idx + 1))) {
      file = fileLine.slice(0, idx);
      line = parseInt(fileLine.slice(idx + 1), 10);
    }
    refs.push({ file, line, name, raw: m[0].trim() });
  }
  return refs;
}

/** Pull last-verified date from SKILL.md (body "**Last verified**" or frontmatter). */
function extractLastVerified(skillContent) {
  if (!skillContent) return null;
  const m =
    skillContent.match(/\*\*Last verified\*\*\s*:?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i) ||
    skillContent.match(/last_updated\s*:\s*["']?([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  return m ? m[1] : null;
}

/**
 * @param {string} cardName
 * @param {(file:string)=>(string|null)} readFile
 * @param {object} oracle — KnowledgeOracle implementation
 * @returns {object} scorecard
 */
function scoreModuleCard(cardName, readFile, oracle) {
  const dimensions = [];

  // ── 1. Structural (2) — no oracle ──────────────────────────
  const struct = validateModuleCardStructure(cardName, readFile);
  const quizContent = readFile('business-quiz.md');
  const quizR = quizContent != null ? lintBusinessQuiz(quizContent) : { issues: [], warnings: [], ok: [] };
  const issues = struct.issues.length + quizR.issues.length;
  const warnings = struct.warnings.length + quizR.warnings.length;
  const structScore = Math.max(0, Math.min(2, 2 - issues * 0.5 - warnings * 0.1));
  dimensions.push({
    key: 'structural',
    max: 2,
    score: round1(structScore),
    verified: true,
    evidence: { issues, warnings, formula: '2 - issues*0.5 - warnings*0.1' },
  });

  // Gather all card content + refs once. Dedupe identical refs — the same code
  // citation appearing in several card files counts once.
  const allContent = ALL_CARD_FILES.map((f) => readFile(f)).filter(Boolean).join('\n');
  const seen = new Set();
  const refs = extractRefs(allContent).filter((r) => {
    const key = `${r.file}:${r.line}:${r.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── 2. Grounded (2) — oracle.symbolExists ──────────────────
  if (refs.length === 0) {
    dimensions.push({
      key: 'grounded',
      max: 2,
      score: 0,
      verified: false,
      evidence: { refs_total: 0, reason: 'không có ref code (Source:) để đối chiếu' },
    });
  } else {
    const probe = oracle.symbolExists(refs[0]);
    if (!probe.supported) {
      dimensions.push({
        key: 'grounded',
        max: 2,
        score: 0,
        verified: false,
        evidence: { refs_total: refs.length, reason: probe.reason || 'oracle không hỗ trợ' },
      });
    } else {
      const broken = [];
      let resolved = 0;
      for (const ref of refs) {
        const r = oracle.symbolExists(ref);
        if (r.exists) resolved++;
        else broken.push(`${ref.raw} — ${r.reason || 'unresolved'}`);
      }
      dimensions.push({
        key: 'grounded',
        max: 2,
        score: round1((resolved / refs.length) * 2),
        verified: true,
        evidence: { refs_total: refs.length, refs_resolved: resolved, broken: broken.slice(0, 10) },
      });
    }
  }

  // ── 3. Freshness / no-drift (1) — oracle.changedSince ──────
  const lastVerified = extractLastVerified(readFile('SKILL.md'));
  const refFiles = [...new Set(refs.map((r) => r.file))];
  if (refFiles.length === 0) {
    dimensions.push({
      key: 'freshness',
      max: 1,
      score: 0,
      verified: false,
      evidence: { reason: 'không có file tham chiếu để kiểm drift' },
    });
  } else {
    const probe = oracle.changedSince(refFiles[0], lastVerified);
    if (!probe.supported || !lastVerified) {
      dimensions.push({
        key: 'freshness',
        max: 1,
        score: 0,
        verified: false,
        evidence: { last_verified: lastVerified, reason: !lastVerified ? 'thiếu Last verified trong SKILL.md' : probe.reason },
      });
    } else {
      const drifted = [];
      let unchanged = 0;
      let checkable = 0;
      for (const f of refFiles) {
        const r = oracle.changedSince(f, lastVerified);
        if (r.changed === null) continue; // not checkable (e.g. file missing) — handled by grounded
        checkable++;
        if (r.changed) drifted.push(`${f} (${r.commits} commit sau ${lastVerified})`);
        else unchanged++;
      }
      dimensions.push({
        key: 'freshness',
        max: 1,
        score: checkable === 0 ? 0 : round1((unchanged / checkable) * 1),
        verified: checkable > 0,
        evidence: {
          last_verified: lastVerified,
          files_checked: checkable,
          drifted: drifted.slice(0, 10),
          // checkable===0 → mọi file ref đều không kiểm được (thiếu file). Không có
          // reason ở đây thì evidenceLine in ra "undefined".
          ...(checkable === 0 ? { reason: 'không có file tham chiếu nào tồn tại để kiểm drift (xem chiều Bằng chứng)' } : {}),
        },
      });
    }
  }

  // ── 4. Coverage (1) — oracle.symbolsOf (full graph) ────────
  // Scope = directories of the card's referenced files (the area it "owns").
  const refDirs = [...new Set(refFiles.map((f) => (f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '.')))];
  const cov = oracle.symbolsOf(cardName, { files: refFiles, dirs: refDirs });
  if (!cov.supported) {
    dimensions.push({
      key: 'coverage',
      max: 1,
      score: 0,
      verified: false,
      evidence: { reason: cov.reason || 'cần full-graph oracle' },
    });
  } else {
    const total = cov.symbols ? cov.symbols.length : 0;
    const mentioned = total === 0 ? 0 : cov.symbols.filter((s) => allContent.includes(s)).length;
    dimensions.push({
      key: 'coverage',
      max: 1,
      score: total === 0 ? 0 : round1((mentioned / total) * 1),
      verified: total > 0,
      evidence: { symbols_total: total, symbols_mentioned: mentioned },
    });
  }

  // ── Totals + honest mode stamp ─────────────────────────────
  const total = round1(dimensions.reduce((s, d) => s + d.score, 0));
  const fullyVerified = dimensions.every((d) => d.verified);
  const stamp = fullyVerified ? '' : oracle.name === 'declared-only' ? '†' : '*';

  return {
    module: cardName,
    oracle: oracle.name,
    objective_total: total,
    objective_max: 6,
    fully_verified: fullyVerified,
    stamp,
    dimensions,
  };
}

module.exports = { scoreModuleCard, extractRefs, extractLastVerified, round1 };
