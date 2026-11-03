/**
 * Files of slice planning inside a feature:
 *   slices.md                       rendered from the active variant (read by people)
 *   slicing/graph.json              generated, never edited by hand
 *   slicing/graphs/<hash>.json      graph history (for `slice impact --since`)
 *   slicing/variants/<name>.yaml
 *   slicing/compare.md
 * Plus the `slicing:` / `slices:` blocks of .flow-state.yaml.
 */
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { buildGraph, serializeGraph } = require('./graph-builder');

const STATE_MARK = '# ── Slice Planning (B.0c) — cập nhật bởi `v-flow slice` ──';

function paths(featureDir) {
  const slicing = path.join(featureDir, 'slicing');
  return {
    slicing,
    graph: path.join(slicing, 'graph.json'),
    history: path.join(slicing, 'graphs'),
    variants: path.join(slicing, 'variants'),
    compare: path.join(slicing, 'compare.md'),
    slicesMd: path.join(featureDir, 'slices.md'),
    state: path.join(featureDir, '.flow-state.yaml'),
    session: path.join(featureDir, '_session.md'),
  };
}

/**
 * Resolve a feature argument: a directory path holding spec.md, an exact feature name,
 * or a prefix such as "001".
 */
function resolveFeatureDir(projectRoot, arg) {
  if (!arg) throw new Error('Thiếu tên feature');
  const direct = path.resolve(projectRoot, arg);
  if (fs.existsSync(path.join(direct, 'spec.md'))) return direct;

  const featuresDir = path.join(projectRoot, '.v-flow', 'features');
  const names = fs.existsSync(featuresDir)
    ? fs.readdirSync(featuresDir).filter((n) => fs.statSync(path.join(featuresDir, n)).isDirectory())
    : [];
  if (names.includes(arg)) return path.join(featuresDir, arg);
  let matches = names.filter((n) => n.startsWith(`${arg}-`));
  if (matches.length === 0) matches = names.filter((n) => n.startsWith(arg));
  if (matches.length === 1) return path.join(featuresDir, matches[0]);
  if (matches.length > 1) throw new Error(`Tên feature "${arg}" mơ hồ: ${matches.join(', ')}`);
  throw new Error(`Không tìm thấy feature "${arg}"${names.length ? ` (có: ${names.join(', ')})` : ''}`);
}

// ── Graph ────────────────────────────────────────────────────

function readGraphFile(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
}

/**
 * Build the graph; write graph.json (+ history snapshot) when it changed and `write` is true.
 * @returns {{ graph, changed: boolean, previousHash: string|null }}
 */
function loadGraph(featureDir, { write = true } = {}) {
  const p = paths(featureDir);
  const graph = buildGraph(featureDir);
  const previous = readGraphFile(p.graph);
  const changed = !previous || previous.hash !== graph.hash;
  if (write) {
    const text = serializeGraph(graph);
    if (!fs.existsSync(p.graph) || fs.readFileSync(p.graph, 'utf8') !== text) {
      fs.ensureDirSync(p.slicing);
      fs.writeFileSync(p.graph, text);
    }
    const snapshot = path.join(p.history, `${graph.hash}.json`);
    if (!fs.existsSync(snapshot)) {
      fs.ensureDirSync(p.history);
      fs.writeFileSync(snapshot, text);
    }
  }
  return { graph, changed, previousHash: previous ? previous.hash : null };
}

function readHistoryGraph(featureDir, hash) {
  return readGraphFile(path.join(paths(featureDir).history, `${hash}.json`));
}

// ── Variants ─────────────────────────────────────────────────

function assertVariantName(name) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name || '')) {
    throw new Error(`Tên variant không hợp lệ: "${name}" (chỉ chữ, số, . _ -)`);
  }
}

function variantPath(featureDir, name) {
  assertVariantName(name);
  return path.join(paths(featureDir).variants, `${name}.yaml`);
}

function listVariants(featureDir) {
  const dir = paths(featureDir).variants;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => f.slice(0, -5)).sort();
}

function variantExists(featureDir, name) {
  return fs.existsSync(variantPath(featureDir, name));
}

function readVariant(featureDir, name) {
  const file = variantPath(featureDir, name);
  if (!fs.existsSync(file)) {
    const all = listVariants(featureDir);
    throw new Error(`Không có variant "${name}"${all.length ? ` (có: ${all.join(', ')})` : ''}`);
  }
  const v = yaml.load(fs.readFileSync(file, 'utf8')) || {};
  return { ...v, variant: v.variant || name };
}

function dumpVariant(variant) {
  return yaml.dump(variant, { lineWidth: -1, flowLevel: 3, noRefs: true });
}

function writeVariant(featureDir, variant) {
  const file = variantPath(featureDir, variant.variant);
  fs.ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, dumpVariant(variant));
  return file;
}

// ── .flow-state.yaml ─────────────────────────────────────────

function readState(featureDir) {
  const file = paths(featureDir).state;
  if (!fs.existsSync(file)) return {};
  return yaml.load(fs.readFileSync(file, 'utf8')) || {};
}

/** Remove a top-level `key:` block (and our marker comment right above it). */
function removeTopBlock(lines, key) {
  const start = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (start === -1) return lines;
  let end = start + 1;
  while (end < lines.length && (/^\s+\S/.test(lines[end]) || /^- /.test(lines[end]) || lines[end].trim() === '')) end++;
  while (end > start + 1 && lines[end - 1].trim() === '') end--;
  const from = start > 0 && lines[start - 1] === STATE_MARK ? start - 1 : start;
  return [...lines.slice(0, from), ...lines.slice(end)];
}

/**
 * Rewrite only the `slicing:` and `slices:` blocks; every other line (and its comments) is kept.
 */
function writeSliceState(featureDir, { slicing, slices }) {
  const file = paths(featureDir).state;
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  let lines = original.split('\n');
  lines = removeTopBlock(lines, 'slicing');
  lines = removeTopBlock(lines, 'slices');
  const head = lines.join('\n').replace(/\s+$/, '');
  const block = yaml.dump({ slicing }, { lineWidth: -1 }) + yaml.dump({ slices }, { lineWidth: -1 });
  fs.writeFileSync(file, `${head ? `${head}\n\n` : ''}${STATE_MARK}\n${block}`);
}

function appendSession(featureDir, text) {
  fs.appendFileSync(paths(featureDir).session, `\n${text.trim()}\n`);
}

module.exports = {
  paths,
  resolveFeatureDir,
  loadGraph,
  readHistoryGraph,
  listVariants,
  variantExists,
  variantPath,
  readVariant,
  dumpVariant,
  writeVariant,
  readState,
  writeSliceState,
  appendSession,
};
