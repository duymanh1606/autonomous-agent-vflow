/**
 * Graph Builder for Slicing
 * Reads spec.md, tasks.md, test-cases.md and builds the normalized slice graph (graph.json).
 * Same input → same output, byte for byte (no timestamps, stable ordering).
 */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs-extra');

const POINTS = { S: 1, M: 2, L: 4 };
const TYPE_TAGS = ['UI', 'API', 'DB', 'LOGIC', 'REFACTOR', 'TEST'];

const FLOW_REF = /\bUC-\d+(?:\.main|-[EA]\d+)\b/g;
const UC_REF = /\bUC-\d+\b(?![.-])/g;
const REQ_REF = /\bREQ-[A-Z]+\d+\b/g;
const AC_REF = /\bAC-\d+\b/g;
const TASK_REF = /\bT-\d+\b/g;
const TC_REF = /\bTC-\d+\b/g;

function normalizeText(text) {
  return (text || '').replace(/\r\n/g, '\n').trim();
}

/** Short content digest — whitespace-insensitive, ignores task checkbox state. */
function digest(text) {
  const canonical = String(text || '')
    .replace(/\[[xX]\]/g, '[ ]')
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 8);
}

function uniq(list) {
  return [...new Set(list)];
}

function refs(text, regex) {
  return uniq(String(text || '').match(regex) || []);
}

function toStep(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^B?(\d+)$/i);
  return m ? `B${m[1]}` : s;
}

/** Split `| a | b |` into trimmed cells. */
function cells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

/** Table rows (as cell arrays) of the first markdown table after the line matching `headingRe`. */
function tableAfter(block, headingRe) {
  const lines = block.split('\n');
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start === -1) return [];
  const rows = [];
  let inTable = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      inTable = true;
      if (/^\|[\s:|-]+\|$/.test(line)) continue; // separator
      rows.push(cells(line));
    } else if (inTable || /^#{1,6}\s/.test(line)) {
      break;
    }
  }
  return rows.slice(1); // drop header
}

/** Split content into blocks by heading regex (must use the `m` and `g` flags, group 1 = id). */
function blocksBy(content, headingRe) {
  const heads = [];
  let m;
  while ((m = headingRe.exec(content)) !== null) {
    heads.push({
      id: m[1],
      title: (m[2] || '').trim(),
      index: m.index,
      bodyStart: m.index + m[0].length,
      level: m[0].match(/^#+/)[0].length,
    });
  }
  return heads.map((h, i) => {
    let end = i + 1 < heads.length ? heads[i + 1].index : content.length;
    // Stop at the next heading of a higher level (e.g. "## 3. Requirements" after the last UC)
    const higher = new RegExp(`^#{1,${h.level - 1}}\\s`, 'm');
    const hm = higher.exec(content.slice(h.bodyStart, end));
    if (hm) end = h.bodyStart + hm.index;
    return { ...h, block: content.slice(h.index, end) };
  });
}

function lineValue(block, labelRe) {
  const m = block.match(new RegExp(`^\\s*-\\s*\\*\\*(?:${labelRe.source})\\*\\*\\s*:?\\s*(.*)$`, 'im'));
  return m ? m[1].trim() : null;
}

// ─────────────────────────────────────────────────────────────
// spec.md
// ─────────────────────────────────────────────────────────────

function parseSpec(spec) {
  const verMatch = spec.match(/Spec\s+Version\**\s*\|?\s*:?\s*`?(v\d+(?:\.\d+)*)/i);
  const specVersion = verMatch ? verMatch[1] : 'v1.0';

  const flows = [];
  for (const uc of blocksBy(spec, /^#{2,4}\s+(UC-\d+)\b\s*:?\s*(.*)$/gm)) {
    const actorMatch = uc.block.match(/\|\s*\*\*(?:Tác nhân chính|Primary Actor)\*\*\s*\|\s*([^|\n]+)\|/i);
    const steps = [];
    const stepDigests = {};
    for (const row of tableAfter(uc.block, /Luồng sự kiện chính|Main Flow/i)) {
      if (!/^B?\d+$/i.test(row[0])) continue;
      const step = toStep(row[0]);
      steps.push(step);
      stepDigests[step] = digest(row.slice(1).join(' | '));
    }
    flows.push({
      id: `${uc.id}.main`,
      uc: uc.id,
      kind: 'main',
      title: uc.title,
      actor: actorMatch ? actorMatch[1].trim() : null,
      steps,
      step_digests: stepDigests,
    });
    for (const row of tableAfter(uc.block, /Luồng ngoại lệ|Exception|Alternative/i)) {
      const id = (row[0] || '').replace(/`/g, '');
      if (!/^UC-\d+-[EA]\d+$/.test(id)) continue;
      flows.push({
        id,
        uc: id.replace(/-[EA]\d+$/, ''),
        kind: /-E\d+$/.test(id) ? 'exception' : 'alternative',
        title: row[2] || '',
        branches_from: toStep(row[1]),
        digest: digest(row.slice(1).join(' | ')),
      });
    }
  }

  const reqs = [];
  const reqRe = /^\s*[-*]\s*\*\*(REQ-[A-Z]+\d+)\*\*\s*:?\s*(.*)$/gm;
  let rm;
  while ((rm = reqRe.exec(spec)) !== null) {
    if (!reqs.some((r) => r.id === rm[1])) reqs.push({ id: rm[1], digest: digest(rm[2]) });
  }

  const acs = [];
  for (const line of spec.split('\n')) {
    const row = line.trim().startsWith('|') ? cells(line) : null;
    if (!row || !/^AC-\d+$/.test(row[0])) continue;
    if (acs.some((a) => a.id === row[0])) continue;
    const rest = row.slice(1).join(' | ');
    acs.push({
      id: row[0],
      explicitFlows: refs(rest, FLOW_REF),
      ucs: refs(rest, UC_REF),
      reqs: refs(rest, REQ_REF),
      digest: digest(rest),
    });
  }

  return { specVersion, flows, reqs, acs };
}

// ─────────────────────────────────────────────────────────────
// tasks.md
// ─────────────────────────────────────────────────────────────

function parseTasks(tasks) {
  return blocksBy(tasks, /^#{3,4}\s+(T-\d+)\b\s*:?\s*(.*)$/gm).map((t) => {
    const tags = [];
    const depends = [];
    const tagRe = /\[([A-Z][A-Z0-9_-]*)(?:\s*:\s*([^\]]+))?\]/g;
    let m;
    while ((m = tagRe.exec(t.title)) !== null) {
      if (m[1] === 'DEPENDS') {
        depends.push(...refs(m[2], TASK_REF));
      } else {
        tags.push(m[2] ? `${m[1]}:${m[2].trim()}` : m[1]);
      }
    }
    const depLine = lineValue(t.block, /Dependency|Dependencies|Phụ thuộc/);
    if (depLine && !/^(không|none|n\/a|—|-)/i.test(depLine)) depends.push(...refs(depLine, TASK_REF));

    const typeLine = lineValue(t.block, /Type|Loại/);
    const type = (typeLine && TYPE_TAGS.find((x) => typeLine.toUpperCase().includes(x)))
      || TYPE_TAGS.find((x) => tags.includes(x))
      || 'LOGIC';

    const complexity = (lineValue(t.block, /Complexity/) || '').toUpperCase().charAt(0);
    const mapping = lineValue(t.block, /REQ\s*\/\s*UC\s*mapping|Mapping/) || '';
    const body = t.block.split('\n').filter((l) => !/\*\*Trạng thái\*\*|\*\*Status\*\*/i.test(l)).join('\n');

    return {
      id: t.id,
      name: t.title.replace(/`?\[[^\]]*\]`?/g, '').trim(),
      type,
      points: POINTS[complexity] || 2,
      tags: uniq(tags),
      depends: uniq(depends).filter((d) => d !== t.id),
      explicitFlows: refs(mapping, FLOW_REF),
      ucs: refs(mapping, UC_REF),
      reqs: refs(mapping, REQ_REF),
      acRefs: refs(lineValue(t.block, /Done khi|Done when/) || '', AC_REF),
      tcRefs: refs(lineValue(t.block, /Test liên quan|Related tests?/) || '', TC_REF),
      digest: digest(body),
    };
  });
}

// ─────────────────────────────────────────────────────────────
// test-cases.md
// ─────────────────────────────────────────────────────────────

function parseTests(tests) {
  return blocksBy(tests, /^#{3,4}\s+(TC-\d+)\b\s*:?\s*(.*)$/gm).map((t) => ({
    id: t.id,
    acRefs: refs(t.block, AC_REF),
    reqs: refs(t.block, REQ_REF),
    taskRefs: refs(t.block, TASK_REF),
  }));
}

// ─────────────────────────────────────────────────────────────
// Assemble
// ─────────────────────────────────────────────────────────────

function sortIds(list) {
  return [...list].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function buildGraphFromContent(specContent, tasksContent, testsContent) {
  const spec = normalizeText(specContent);
  const tasks = normalizeText(tasksContent);
  const tests = normalizeText(testsContent);

  const hash = crypto.createHash('sha256')
    .update(`${spec}\n---\n${tasks}\n---\n${tests}`)
    .digest('hex')
    .slice(0, 8);

  const parsedSpec = parseSpec(spec);
  const parsedTasks = parseTasks(tasks);
  const parsedTests = parseTests(tests);

  const broken = [];
  const warnings = [];
  const flowIds = new Set(parsedSpec.flows.map((f) => f.id));
  const ucIds = new Set(parsedSpec.flows.map((f) => f.uc));
  const unitIds = new Set(parsedTasks.map((u) => u.id));
  const acIds = new Set(parsedSpec.acs.map((a) => a.id));
  const tcIds = new Set(parsedTests.map((t) => t.id));
  const ucFlows = (uc) => parsedSpec.flows.filter((f) => f.uc === uc).map((f) => f.id);

  // Units
  const units = parsedTasks.map((t) => {
    for (const f of t.explicitFlows) {
      if (!flowIds.has(f)) broken.push({ source: t.id, target: f, type: 'flow_not_found' });
    }
    for (const uc of t.ucs) {
      if (!ucIds.has(uc)) broken.push({ source: t.id, target: uc, type: 'uc_not_found' });
    }
    for (const d of t.depends) {
      if (!unitIds.has(d)) broken.push({ source: t.id, target: d, type: 'task_not_found' });
    }
    for (const a of t.acRefs) {
      if (!acIds.has(a)) broken.push({ source: t.id, target: a, type: 'ac_not_found' });
    }
    for (const tc of t.tcRefs) {
      if (!tcIds.has(tc)) broken.push({ source: t.id, target: tc, type: 'test_not_found' });
    }

    let flows = t.explicitFlows.filter((f) => flowIds.has(f));
    const ucLevel = t.ucs.filter((uc) => ucIds.has(uc) && !flows.some((f) => f.startsWith(`${uc}.`) || f.startsWith(`${uc}-`)));
    if (ucLevel.length > 0) {
      flows = uniq([...flows, ...ucLevel.flatMap(ucFlows)]);
      warnings.push({
        source: t.id,
        type: 'uc_level_mapping',
        message: `${t.id} chỉ map tới mức UC (${ucLevel.join(', ')}) → coi như phục vụ mọi luồng của UC; nên ghi tới mức luồng (vd ${ucLevel[0]}.main)`,
      });
    }
    if (flows.length === 0 && !t.tags.includes('FOUNDATION')) {
      warnings.push({
        source: t.id,
        type: 'unmapped_unit',
        message: `${t.id} không phục vụ luồng nào và không có tag [FOUNDATION]`,
      });
    }
    return {
      id: t.id,
      name: t.name,
      type: t.type,
      points: t.points,
      tags: t.tags,
      depends: t.depends.filter((d) => unitIds.has(d)),
      flows: sortIds(flows),
      reqs: t.reqs,
      digest: t.digest,
    };
  });

  // ACs
  const acs = parsedSpec.acs.map((a) => {
    for (const f of a.explicitFlows) {
      if (!flowIds.has(f)) broken.push({ source: a.id, target: f, type: 'flow_not_found' });
    }
    let flows = a.explicitFlows.filter((f) => flowIds.has(f));
    if (flows.length === 0) {
      flows = a.ucs.filter((uc) => flowIds.has(`${uc}.main`)).map((uc) => `${uc}.main`);
    }
    const acUnits = parsedTasks.filter((t) => t.acRefs.includes(a.id)).map((t) => t.id);
    return { id: a.id, flows: sortIds(flows), units: sortIds(acUnits), reqs: a.reqs, digest: a.digest };
  });

  // Tests: explicit AC refs, else ACs sharing a REQ
  const testsOut = parsedTests.map((t) => {
    for (const a of t.acRefs) {
      if (!acIds.has(a)) broken.push({ source: t.id, target: a, type: 'ac_not_found' });
    }
    for (const u of t.taskRefs) {
      if (!unitIds.has(u)) broken.push({ source: t.id, target: u, type: 'task_not_found' });
    }
    const testAcs = t.acRefs.filter((a) => acIds.has(a)).length > 0
      ? t.acRefs.filter((a) => acIds.has(a))
      : acs.filter((a) => a.reqs.some((r) => t.reqs.includes(r))).map((a) => a.id);
    const testUnits = new Set(t.taskRefs.filter((u) => unitIds.has(u)));
    for (const task of parsedTasks) {
      if (task.tcRefs.includes(t.id)) testUnits.add(task.id);
    }
    for (const a of acs) {
      if (testAcs.includes(a.id)) a.units.forEach((u) => testUnits.add(u));
    }
    return { id: t.id, acs: sortIds(testAcs), units: sortIds(testUnits) };
  });

  return {
    spec_version: parsedSpec.specVersion,
    hash,
    flows: parsedSpec.flows,
    units,
    acs,
    tests: testsOut,
    reqs: parsedSpec.reqs,
    diagnostics: { broken_references: broken, warnings },
  };
}

function buildGraph(featureDir) {
  const read = (name, required) => {
    const p = path.join(featureDir, name);
    if (!fs.existsSync(p)) {
      if (required) throw new Error(`Thiếu ${name} tại ${featureDir}`);
      return '';
    }
    return fs.readFileSync(p, 'utf8');
  };
  return buildGraphFromContent(read('spec.md', true), read('tasks.md', true), read('test-cases.md', false));
}

/** Serialize a graph deterministically. */
function serializeGraph(graph) {
  return `${JSON.stringify(graph, null, 2)}\n`;
}

module.exports = {
  buildGraph,
  buildGraphFromContent,
  serializeGraph,
  digest,
};
