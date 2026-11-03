/**
 * Dev Quiz Grade — machine-graded technical verification (Decision 2: Dev = graph key).
 *
 * Mirror of business-quiz but the answer key is the GRAPH, not a human. Each
 * question declares a `target` symbol + `direction`; ground truth = the symbol's
 * real blast radius from `oracle.impact()`. An answer set is graded by F1 against
 * that ground truth — objective, reproducible, no human grader needed.
 *
 * Two modes (driven by the command):
 *   - generate: ground truth only (a graph-derived answer key for a tech lead)
 *   - grade:    compare an answers file to ground truth → precision/recall/F1
 *
 * Pure: (content, answers, oracle) → result. The oracle is injectable (stub-tested).
 */

/** Parse `### DQ01: name [target: foo | direction: upstream]` blocks. */
function parseDevQuestions(content) {
  const out = [];
  const lines = (content || '').split('\n');
  for (const line of lines) {
    const m = line.match(/^###\s+(DQ\d+)\s*:?\s*(.*?)\s*\[([^\]]+)\]/);
    if (!m) continue;
    const meta = {};
    for (const part of m[3].split('|')) {
      const kv = part.split(':');
      if (kv.length >= 2) meta[kv[0].trim().toLowerCase()] = kv.slice(1).join(':').trim();
    }
    if (!meta.target) continue;
    out.push({ id: m[1], name: m[2].trim(), target: meta.target, direction: meta.direction || 'upstream' });
  }
  return out;
}

/** Parse an answers file: DQ block → list of symbol names after `**Answer**`. */
function parseAnswers(content) {
  const map = {};
  if (!content) return map;
  const lines = content.split('\n');
  let cur = null;
  let capturing = false;
  for (const line of lines) {
    const h = line.match(/^###\s+(DQ\d+)\b/);
    if (h) {
      cur = h[1];
      map[cur] = map[cur] || [];
      capturing = false;
      continue;
    }
    if (!cur) continue;
    if (/^\*\*Answer\*\*/i.test(line)) {
      capturing = true;
      map[cur].push(...tokenize(line.replace(/^\*\*Answer\*\*\s*:?\s*/i, '')));
      continue;
    }
    if (capturing) {
      if (/^\*\*/.test(line) || /^##/.test(line) || /^---/.test(line)) {
        capturing = false;
        continue;
      }
      map[cur].push(...tokenize(line));
    }
  }
  return map;
}

/** Extract identifier-ish tokens from a line (handles backticks, commas, bullets). */
function tokenize(text) {
  return (text.match(/[A-Za-z_][\w.]*/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !/^(và|hoặc|the|and|or|none|không)$/i.test(s));
}

function norm(s) {
  return String(s).trim().toLowerCase();
}

/** F1 of an answer set vs a truth set (both arrays of names). */
function scoreSets(answer, truth) {
  const a = new Set(answer.map(norm));
  const t = new Set(truth.map(norm));
  if (t.size === 0) return { f1: a.size === 0 ? 1 : 0, tp: 0, precision: a.size === 0 ? 1 : 0, recall: 1 };
  let tp = 0;
  for (const x of a) if (t.has(x)) tp++;
  const precision = a.size === 0 ? 0 : tp / a.size;
  const recall = tp / t.size;
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { f1: Math.round(f1 * 100) / 100, tp, precision: Math.round(precision * 100) / 100, recall: Math.round(recall * 100) / 100 };
}

/**
 * Build the ground-truth answer key from the graph (no answers needed).
 * @returns {{ questions: Array, verified: boolean }}
 */
function generateGroundTruth(quizContent, oracle) {
  const questions = parseDevQuestions(quizContent).map((q) => {
    const imp = oracle.impact(q.target, q.direction);
    return {
      ...q,
      found: !!imp.found,
      risk: imp.risk,
      truth: imp.found ? imp.affected : [],
      reason: imp.found ? undefined : imp.reason,
    };
  });
  return { questions, verified: questions.some((q) => q.found) };
}

/**
 * Grade an answers file vs graph ground truth.
 * @returns {{ questions: Array, score: number, max: number, verified: boolean }}
 */
function gradeDevQuiz(quizContent, answersContent, oracle) {
  const answers = parseAnswers(answersContent);
  const questions = parseDevQuestions(quizContent).map((q) => {
    const imp = oracle.impact(q.target, q.direction);
    if (!imp.supported) return { ...q, verified: false, reason: 'oracle không hỗ trợ impact' };
    if (!imp.found) return { ...q, verified: false, reason: imp.reason || 'symbol không có trong graph' };
    const ans = answers[q.id] || [];
    const s = scoreSets(ans, imp.affected);
    return { ...q, verified: true, risk: imp.risk, truth: imp.affected, answered: ans, ...s };
  });
  const graded = questions.filter((q) => q.verified);
  const score = graded.length === 0 ? 0 : Math.round((graded.reduce((s, q) => s + q.f1, 0) / graded.length) * 100) / 100;
  return { questions, score, max: 1, verified: graded.length > 0 };
}

module.exports = { parseDevQuestions, parseAnswers, tokenize, scoreSets, generateGroundTruth, gradeDevQuiz };
