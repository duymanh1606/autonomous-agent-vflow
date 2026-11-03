/**
 * Slice planning operations behind `v-flow slice …`. Each returns plain data for the command
 * layer to print; user-facing failures throw SliceError (details = lines to show).
 */
const path = require('path');
const fs = require('fs-extra');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const store = require('./store');
const { loadSlicingConfig } = require('./config');
const { getStrategyRegistry, COMMON_PARAMS } = require('./strategy-registry');
const { resolveParams, buildVariant, ACTIVE_STATUSES } = require('./planner');
const { evaluateVariant } = require('./evaluator');
const { loadMetrics, computeMetrics } = require('./metrics');
const { compareVariants, runBench } = require('./compare');
const { parseChangeSpec, diffGraphs, computeImpact } = require('./impact');
const progress = require('./progress');
const render = require('./render');
const { buildGraph } = require('./graph-builder');
const vsafImport = require('./vsaf-import');

class SliceError extends Error {
  constructor(message, details = [], hint = null) {
    super(message);
    this.name = 'SliceError';
    this.details = details;
    this.hint = hint;
  }
}

function context(projectRoot, feature) {
  let featureDir;
  try {
    featureDir = store.resolveFeatureDir(projectRoot, feature);
  } catch (err) {
    throw new SliceError(err.message);
  }
  return { featureDir, config: loadSlicingConfig(projectRoot) };
}

function brokenLines(graph) {
  return graph.diagnostics.broken_references.map((b) => `${b.source} → ${b.target} (${b.type})`);
}

function assertNoBroken(graph) {
  const lines = brokenLines(graph);
  if (lines.length > 0) {
    throw new SliceError(`Graph có ${lines.length} tham chiếu hỏng — sửa tasks/spec/test-cases trước khi cắt slice`, lines);
  }
}

function isStale(variant, graph) {
  return (variant.provenance || {}).graph_hash !== graph.hash;
}

function activeOf(state) {
  return ((state || {}).slicing || {}).active_variant || null;
}

function gitUser() {
  try {
    return execSync('git config user.name', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || null;
  } catch {
    return null;
  }
}

function violationLines(evaluation, severity = null) {
  return evaluation.violations
    .filter((v) => !severity || v.severity === severity)
    .map((v) => `[${v.severity}] ${v.rule}${v.slice ? ` (${v.slice})` : ''}: ${v.message}`);
}

// ── graph ────────────────────────────────────────────────────

function graph(projectRoot, feature, { dryRun = false } = {}) {
  const { featureDir } = context(projectRoot, feature);
  const res = store.loadGraph(featureDir, { write: !dryRun });
  return { featureDir, ...res, file: store.paths(featureDir).graph };
}

// ── strategies ───────────────────────────────────────────────

function strategies(projectRoot) {
  const config = loadSlicingConfig(projectRoot);
  return [...getStrategyRegistry(projectRoot).values()].map((s) => {
    const fromConfig = (config.strategy_params || {})[s.name] || {};
    const params = Object.entries({ ...(s.params || {}) }).map(([k, d]) => ({
      name: k,
      type: d.type,
      default: fromConfig[k] !== undefined ? fromConfig[k] : d.default,
      description: d.description || '',
    }));
    return { name: s.name, description: s.description || '', source: s.source, params };
  });
}

function commonParams() {
  return Object.entries(COMMON_PARAMS).map(([k, d]) => ({ name: k, default: d.default, description: d.description }));
}

// ── plan / sweep ─────────────────────────────────────────────

function getStrategyOrThrow(projectRoot, name) {
  const registry = getStrategyRegistry(projectRoot);
  const s = registry.get(name);
  if (!s) throw new SliceError(`Không có strategy "${name}"`, [], `Có: ${[...registry.keys()].join(', ')}`);
  return s;
}

function plan(projectRoot, feature, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  const dryRun = !!opts.dryRun;
  const { graph: g } = store.loadGraph(featureDir, { write: !dryRun });
  assertNoBroken(g);

  const strategy = getStrategyOrThrow(projectRoot, opts.strategy || config.default_strategy);
  const isManual = strategy.name === 'manual';
  const name = opts.as || (isManual && opts.from ? path.basename(opts.from).replace(/\.ya?ml$/i, '') : strategy.name);
  try {
    store.variantPath(featureDir, name);
  } catch (err) {
    throw new SliceError(err.message);
  }

  const state = store.readState(featureDir);
  const exists = store.variantExists(featureDir, name);
  if (exists && activeOf(state) === name && state.slicing.locked) {
    throw new SliceError(`Variant "${name}" đang được khóa (active) — không thể ghi đè`, [], 'Dùng tên khác với --as, hoặc mở khóa: v-flow slice use <feature> <variant> --unlock --reason "…"');
  }
  if (exists && !opts.overwrite) {
    throw new SliceError(`Variant "${name}" đã tồn tại`, [], 'Thêm --overwrite hoặc đặt tên khác với --as');
  }

  let source = null;
  const cliParams = { ...(opts.params || {}) };
  if (isManual) {
    if (!opts.from) throw new SliceError('Strategy manual cần --from <file.yaml>');
    const fromPath = path.resolve(projectRoot, opts.from);
    if (!fs.existsSync(fromPath)) throw new SliceError(`Không thấy file ${opts.from}`);
    try {
      source = yaml.load(fs.readFileSync(fromPath, 'utf8'));
    } catch (err) {
      throw new SliceError(`Strategy "manual": YAML không hợp lệ — ${err.message}`);
    }
    cliParams.from = opts.from;
  }

  let keepDone = null;
  if (opts.keepDone) {
    const active = activeOf(state);
    if (!active) throw new SliceError('--keep-done cần feature đã có active variant');
    keepDone = {
      variant: store.readVariant(featureDir, active),
      statuses: Object.fromEntries((state.slices || []).map((e) => [e.id, e.status])),
    };
  }

  let variant;
  try {
    const params = resolveParams(strategy, cliParams, config);
    variant = buildVariant({
      name,
      graph: g,
      strategy,
      params,
      source,
      createdBy: opts.createdBy || (isManual ? 'manual' : 'cli'),
      now: opts.now,
      keepDone,
    });
  } catch (err) {
    throw new SliceError(err.message);
  }

  const file = dryRun ? null : store.writeVariant(featureDir, variant);
  const evaluation = evaluateVariant(g, variant, config, opts.profile || null);
  const metrics = computeMetrics(g, variant, loadMetrics(projectRoot));
  return { featureDir, variant, evaluation, metrics, file, graph: g };
}

/**
 * Mặc định của `slice import-vsaf`. Đặt ở đây (không phải trong vsaf-import.js) vì đây là quy ước
 * **layout của V-Flow**, còn module kia chỉ biết về định dạng VSAF.
 */
const VSAF_PATHS = {
  slices: path.join('.v-flow', 'slices'),
  wbs: path.join('.v-flow', 'architecture', 'project_wbs.md'),
  taskMap: path.join('.v-flow', 'architecture', 'wbs-task-map.yaml'),
};

/**
 * Nạp slice manifest chuẩn VSAF (`.v-flow/slices/SLICE-*.md`) thành một variant của V-Flow.
 *
 * Hai cổng, theo đúng thứ tự: audit G1–G5 trên WBS unit (FAIL → dừng, không ghi gì) rồi luật
 * R1–R11 trên task graph (do evaluator chạy, in ra như `slice plan`). `opts.check` dừng sau cổng
 * một và không ghi file.
 */
function importVsaf(projectRoot, feature, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  const dryRun = !!opts.dryRun || !!opts.check;
  const { graph: g } = store.loadGraph(featureDir, { write: !dryRun });
  assertNoBroken(g);

  const slicesDir = path.resolve(projectRoot, opts.slices || VSAF_PATHS.slices);
  const wbsPath = path.resolve(projectRoot, opts.wbs || VSAF_PATHS.wbs);
  const taskMapPath = path.resolve(projectRoot, opts.taskMap || VSAF_PATHS.taskMap);

  if (!fs.existsSync(slicesDir)) {
    throw new SliceError(`Không thấy thư mục slice manifest: ${path.relative(projectRoot, slicesDir)}`, [], 'Chạy /v.slice --vsaf (skill ntapp-slice-planning) để sinh SLICE-*.md trước');
  }
  const files = fs.readdirSync(slicesDir)
    .filter((f) => /^SLICE-.*\.md$/.test(f))
    .sort((a, b) => vsafImport.sliceNum(a.split('-')[1]) - vsafImport.sliceNum(b.split('-')[1]));
  if (files.length === 0) {
    throw new SliceError(`Không có SLICE-*.md trong ${path.relative(projectRoot, slicesDir)}`, [], 'Chạy /v.slice --vsaf trước');
  }

  let slices;
  try {
    slices = files.map((f) => vsafImport.parseManifest(fs.readFileSync(path.join(slicesDir, f), 'utf8'), f));
  } catch (err) {
    throw new SliceError(`Slice manifest không đọc được — ${err.message}`);
  }

  // WBS là tùy chọn: thiếu nó thì G1 chỉ còn bắt được trùng lặp, không bắt được unit mồ côi.
  let wbsUnits = new Set();
  const wbsFound = fs.existsSync(wbsPath);
  if (wbsFound) wbsUnits = vsafImport.parseWbsUnits(fs.readFileSync(wbsPath, 'utf8'));

  const taskMapFound = fs.existsSync(taskMapPath);
  const taskMap = taskMapFound ? vsafImport.parseTaskMap(fs.readFileSync(taskMapPath, 'utf8')) : new Map();

  const audit = vsafImport.auditInvariants(slices, wbsUnits);
  const failed = audit.filter((r) => r.pass === false);
  if (failed.length > 0 && !opts.force) {
    throw new SliceError(
      `Slice manifest không qua audit VSAF (${failed.length}/${audit.filter((r) => r.pass !== null).length} invariant FAIL)`,
      failed.map((r) => `${r.id} ${r.name}: ${r.note}`),
      'Sửa .v-flow/slices/SLICE-*.md rồi import lại (--force để bỏ qua, chỉ dùng khi thử nghiệm)',
    );
  }

  const name = opts.as || 'vsaf';
  const source = vsafImport.toVariantSource(slices, taskMap, g, {
    slices_dir: path.relative(projectRoot, slicesDir),
    wbs: wbsFound ? path.relative(projectRoot, wbsPath) : null,
    task_map: taskMapFound ? path.relative(projectRoot, taskMapPath) : null,
    manifests: files.length,
  });

  const warnings = [...source.warnings];
  if (!wbsFound) warnings.push(`không thấy ${path.relative(projectRoot, wbsPath)} — G1 không kiểm được unit mồ côi`);
  if (!taskMapFound) warnings.push(`không thấy ${path.relative(projectRoot, taskMapPath)} — mọi slice sẽ không có task nào`);

  const result = {
    featureDir, graph: g, audit, warnings, mapping: source.mapping,
    variantName: name, manifests: files.length,
    paths: { slices: slicesDir, wbs: wbsPath, taskMap: taskMapPath },
  };
  if (opts.check) return { ...result, checkOnly: true, variant: null, evaluation: null, metrics: null, file: null, mapFile: null };

  const state = store.readState(featureDir);
  const exists = store.variantExists(featureDir, name);
  if (exists && activeOf(state) === name && state.slicing.locked) {
    throw new SliceError(`Variant "${name}" đang được khóa (active) — không thể ghi đè`, [], 'Mở khóa: v-flow slice use <feature> <variant> --unlock --reason "…"');
  }
  if (exists && !opts.overwrite) {
    throw new SliceError(`Variant "${name}" đã tồn tại`, [], 'Thêm --overwrite, hoặc đặt tên khác với --as');
  }

  const strategy = getStrategyOrThrow(projectRoot, 'manual');
  let variant;
  try {
    variant = buildVariant({
      name,
      graph: g,
      strategy,
      params: resolveParams(strategy, { from: path.relative(projectRoot, slicesDir) }, config),
      source,
      createdBy: opts.createdBy || 'vsaf',
      now: opts.now,
    });
  } catch (err) {
    throw new SliceError(err.message);
  }

  const file = store.writeVariant(featureDir, variant);
  const mapText = vsafImport.renderVsafMap({
    feature: path.basename(featureDir),
    variant: name,
    mapping: source.mapping,
    slicesDir: path.relative(projectRoot, slicesDir),
    wbsPath: path.relative(projectRoot, wbsPath),
    taskMapPath: path.relative(projectRoot, taskMapPath),
    now: opts.now || new Date().toISOString(),
  });
  const mapFile = path.join(store.paths(featureDir).slicing, `vsaf-map.md`);
  fs.outputFileSync(mapFile, mapText);

  const evaluation = evaluateVariant(g, variant, config, opts.profile || null);
  const metrics = computeMetrics(g, variant, loadMetrics(projectRoot));
  return { ...result, variant, evaluation, metrics, file, mapFile };
}

function cartesian(entries) {
  return entries.reduce((acc, [k, values]) => acc.flatMap((combo) => values.map((v) => ({ ...combo, [k]: v }))), [{}]);
}

function sweep(projectRoot, feature, opts = {}) {
  const sweepParams = Object.entries(opts.params || {}).map(([k, v]) => [k, String(v).split(',').map((x) => x.trim()).filter(Boolean)]);
  if (sweepParams.length === 0) throw new SliceError('sweep cần ít nhất một --param k=v1,v2,…');
  const { featureDir } = context(projectRoot, feature);
  const strategyName = opts.strategy;
  if (!strategyName) throw new SliceError('sweep cần --strategy');
  const results = [];
  for (const combo of cartesian(sweepParams)) {
    const name = `${strategyName}-${Object.entries(combo).map(([k, v]) => `${k}${v}`).join('-')}`.replace(/[^A-Za-z0-9._-]/g, '_');
    if (store.variantExists(featureDir, name) && !opts.overwrite) {
      results.push({ name, skipped: true });
      continue;
    }
    const r = plan(projectRoot, feature, { ...opts, strategy: strategyName, params: combo, as: name, overwrite: opts.overwrite });
    results.push({ name, skipped: false, evaluation: r.evaluation, metrics: r.metrics });
  }
  return { featureDir, results };
}

// ── check / show / compare ───────────────────────────────────

function pickVariant(featureDir, name) {
  const state = store.readState(featureDir);
  const chosen = name || activeOf(state);
  if (!chosen) throw new SliceError('Chưa có active variant — chỉ định --variant <tên>', [], `Variant hiện có: ${store.listVariants(featureDir).join(', ') || '(chưa có)'}`);
  try {
    return store.readVariant(featureDir, chosen);
  } catch (err) {
    throw new SliceError(err.message);
  }
}

function evaluateSafe(g, variant, config, profile) {
  try {
    return evaluateVariant(g, variant, config, profile);
  } catch (err) {
    throw new SliceError(err.message);
  }
}

function check(projectRoot, feature, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  const { graph: g } = store.loadGraph(featureDir, { write: !opts.dryRun });
  const variant = pickVariant(featureDir, opts.variant);
  const evaluation = evaluateSafe(g, variant, config, opts.profile || null);
  return { featureDir, variant, evaluation, stale: isStale(variant, g) };
}

function show(projectRoot, feature, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  const { graph: g } = store.loadGraph(featureDir, { write: !opts.dryRun });
  const variant = pickVariant(featureDir, opts.variant);
  const evaluation = evaluateSafe(g, variant, config, opts.profile || null);
  const metrics = computeMetrics(g, variant, loadMetrics(projectRoot));
  const stale = isStale(variant, g);
  const text = opts.format === 'mermaid'
    ? `${render.mermaid(variant)}\n`
    : render.renderShowMd(g, variant, evaluation, metrics, stale);
  return { featureDir, variant, evaluation, metrics, stale, text };
}

function compare(projectRoot, feature, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  const { graph: g } = store.loadGraph(featureDir, { write: !opts.dryRun });
  const names = (opts.names && opts.names.length) ? opts.names : store.listVariants(featureDir);
  if (names.length === 0) throw new SliceError('Chưa có variant nào', [], 'Chạy: v-flow slice plan <feature> --strategy <s>');
  let variants;
  try {
    variants = names.map((n) => ({ name: n, variant: store.readVariant(featureDir, n) }));
  } catch (err) {
    throw new SliceError(err.message);
  }
  let result;
  try {
    result = compareVariants({ graph: g, variants, config, profile: opts.profile || config.active_profile, metrics: loadMetrics(projectRoot) });
  } catch (err) {
    throw new SliceError(err.message);
  }
  const md = render.renderCompareMd(result);
  const file = store.paths(featureDir).compare;
  if (!opts.dryRun) {
    fs.ensureDirSync(path.dirname(file));
    fs.writeFileSync(file, md);
  }
  let text = md;
  if (opts.format === 'json') text = `${JSON.stringify(result, null, 2)}\n`;
  if (opts.format === 'csv') text = render.renderCompareCsv(result);
  return { featureDir, result, text, file: opts.dryRun ? null : file };
}

// ── use ──────────────────────────────────────────────────────

function use(projectRoot, feature, name, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  if (config.enabled === false) {
    throw new SliceError('slicing.enabled = false — feature chạy như một slice; không đặt active variant');
  }
  if (opts.unlock && !opts.reason) throw new SliceError('--unlock cần --reason "…"');

  const { graph: g } = store.loadGraph(featureDir, { write: !opts.dryRun });
  let variant;
  try {
    variant = store.readVariant(featureDir, name);
  } catch (err) {
    throw new SliceError(err.message);
  }
  const state = store.readState(featureDir);
  const cur = state.slicing || {};
  const entries = state.slices || [];
  const switching = !!cur.active_variant && cur.active_variant !== name;
  const started = entries.filter((e) => ACTIVE_STATUSES.includes(e.status));

  if (switching && (cur.locked || started.length > 0) && !opts.unlock) {
    const why = cur.locked ? `"${cur.active_variant}" đang khóa` : `đã có slice bắt đầu (${started.map((e) => `${e.id}:${e.status}`).join(', ')})`;
    throw new SliceError(`Không thể đổi sang "${name}": ${why}`, [], 'Thêm --unlock --reason "…" (lý do được ghi vào _session.md)');
  }
  if (isStale(variant, g)) {
    throw new SliceError(`Variant "${name}" stale: sinh từ graph ${(variant.provenance || {}).graph_hash}, graph hiện tại ${g.hash}`, [], `Sinh lại: v-flow slice plan ${feature} --strategy ${(variant.provenance || {}).strategy || '<s>'} --as ${name} --overwrite`);
  }
  const evaluation = evaluateSafe(g, variant, config, 'strict');
  if (evaluation.errorCount > 0) {
    throw new SliceError(`Variant "${name}" không qua profile strict (${evaluation.errorCount} lỗi)`, violationLines(evaluation, 'error'));
  }
  if (switching && started.length > 0) {
    let old = null;
    try {
      old = store.readVariant(featureDir, cur.active_variant);
    } catch {
      old = null;
    }
    const problems = [];
    for (const e of started) {
      const ns = variant.slices.find((s) => s.id === e.id);
      const os = old && old.slices.find((s) => s.id === e.id);
      if (!ns) problems.push(`${e.id} (${e.status}) không còn trong "${name}"`);
      else if (os && !(os.units || []).every((u) => (ns.units || []).includes(u))) problems.push(`${e.id} (${e.status}) đổi task trong "${name}"`);
    }
    if (problems.length > 0) {
      throw new SliceError('Variant mới phải giữ nguyên ID và task của slice đã bắt đầu', problems, `Sinh lại với: v-flow slice plan ${feature} --keep-done`);
    }
  }

  const now = opts.now || new Date().toISOString();
  const slicing = {
    active_variant: name,
    graph_hash: g.hash,
    locked: false,
    locked_by: null,
    locked_at: null,
  };
  if (!switching && cur.locked && !opts.unlock) {
    Object.assign(slicing, { locked: true, locked_by: cur.locked_by || null, locked_at: cur.locked_at || null });
  }
  if (opts.lock) {
    Object.assign(slicing, { locked: true, locked_by: opts.by || gitUser() || process.env.USER || 'unknown', locked_at: now });
  }
  const slices = progress.syncEntries(variant, entries);

  if (!opts.dryRun) {
    fs.writeFileSync(store.paths(featureDir).slicesMd, render.renderSlicesMd(g, variant, slicing));
    store.writeSliceState(featureDir, { slicing, slices });
    if (opts.unlock) {
      store.appendSession(featureDir, `### [B.0c] Slice — mở khóa ${cur.active_variant || name} — ${now.slice(0, 10)}
- **Variant mới**: ${name}${slicing.locked ? ' (đã khóa lại)' : ''}
- **Lý do**: ${opts.reason}`);
    }
  }
  return { featureDir, variant, evaluation, slicing, switching };
}

// ── impact ───────────────────────────────────────────────────

function summarizeChange(change, added) {
  const parts = [];
  if (change.steps.length) parts.push(`bước ${change.steps.map((s) => `${s.uc}:${s.step}`).join(', ')}`);
  if (change.flows.length) parts.push(`luồng ${change.flows.join(', ')}`);
  if (change.reqs.length) parts.push(`REQ ${change.reqs.join(', ')}`);
  if (change.acs.length) parts.push(`AC ${change.acs.join(', ')}`);
  const newUnits = (added && added.units) || [];
  const changedUnits = change.units.filter((u) => !newUnits.includes(u));
  if (changedUnits.length) parts.push(`task ${changedUnits.join(', ')}`);
  if (newUnits.length) parts.push(`task mới ${newUnits.join(', ')}`);
  return parts.join('; ') || 'không có thay đổi';
}

function impact(projectRoot, feature, opts = {}) {
  const { featureDir } = context(projectRoot, feature);
  const state = store.readState(featureDir);
  const active = activeOf(state);
  if (!active) throw new SliceError('Feature chưa có active variant — không có slice để tính ảnh hưởng');
  const variant = store.readVariant(featureDir, active);
  const simulate = !!opts.simulate;
  const { graph: g } = store.loadGraph(featureDir, { write: !simulate && !opts.dryRun });

  if (simulate) {
    let change;
    try {
      change = parseChangeSpec(opts.simulate);
    } catch (err) {
      throw new SliceError(err.message);
    }
    return { featureDir, simulated: true, change, result: computeImpact(g, variant, change), summary: summarizeChange(change) };
  }

  const since = opts.since || (state.slicing || {}).graph_hash || (variant.provenance || {}).graph_hash;
  if (since === g.hash) {
    return { featureDir, simulated: false, unchanged: true, since, result: computeImpact(g, variant, {}) };
  }
  const old = store.readHistoryGraph(featureDir, since);
  if (!old) throw new SliceError(`Không có snapshot graph ${since} trong slicing/graphs/`, [], 'Chỉ định --since <hash> có trong slicing/graphs/');

  const { change, added, removed } = diffGraphs(old, g);
  const result = computeImpact(g, variant, change);
  const summary = summarizeChange(change, added);
  const reason = `spec ${old.spec_version} → ${g.spec_version}: ${summary}`;

  if (!opts.dryRun) {
    const slices = progress.applyImpact(variant, state.slices || [], result, reason);
    store.writeSliceState(featureDir, { slicing: { ...state.slicing, graph_hash: g.hash }, slices });
    const rebased = {
      ...variant,
      provenance: { ...variant.provenance, graph_hash: g.hash, spec_version: g.spec_version, rebased_from: since },
    };
    store.writeVariant(featureDir, rebased);
    fs.writeFileSync(store.paths(featureDir).slicesMd, render.renderSlicesMd(g, rebased, state.slicing || {}));
  }
  return { featureDir, simulated: false, since, change, added, removed, result, summary };
}

// ── mark (per-slice progress) ────────────────────────────────

function mark(projectRoot, feature, sliceId, action, opts = {}) {
  const { featureDir, config } = context(projectRoot, feature);
  if (config.enabled === false) throw new SliceError('slicing.enabled = false — feature chạy như một slice, bỏ qua --slice');
  const state = store.readState(featureDir);
  const active = activeOf(state);
  if (!active) throw new SliceError('Feature chưa có active variant — chạy như một slice, bỏ qua --slice');
  const variant = store.readVariant(featureDir, active);
  let res;
  try {
    res = progress.transition(variant, state.slices || [], sliceId, action, opts);
  } catch (err) {
    throw new SliceError(err.message);
  }
  if (!opts.dryRun) store.writeSliceState(featureDir, { slicing: state.slicing, slices: res.entries });
  return { featureDir, ...res };
}

// ── validate --strict ────────────────────────────────────────

/**
 * Slice rules under profile `strict` for a feature with an active variant.
 * @returns {null | { variant, stale, evaluation }} null = no active variant / slicing disabled
 */
function sliceGate(projectRoot, featureDir) {
  const config = loadSlicingConfig(projectRoot);
  if (config.enabled === false) return null;
  const active = activeOf(store.readState(featureDir));
  if (!active || !store.variantExists(featureDir, active)) return null;
  const variant = store.readVariant(featureDir, active);
  const { graph: g } = store.loadGraph(featureDir, { write: false });
  return { variant: active, stale: isStale(variant, g), evaluation: evaluateVariant(g, variant, config, 'strict') };
}

// ── bench ────────────────────────────────────────────────────

function benchFeatureDirs(projectRoot, opts) {
  if (opts.fixtures) {
    const dir = path.resolve(projectRoot, opts.fixtures);
    if (!fs.existsSync(dir)) throw new SliceError(`Không thấy thư mục fixtures ${opts.fixtures}`);
    if (fs.existsSync(path.join(dir, 'spec.md'))) return [dir];
    return fs.readdirSync(dir).sort().map((n) => path.join(dir, n))
      .filter((p) => fs.existsSync(path.join(p, 'spec.md')) && fs.existsSync(path.join(p, 'tasks.md')));
  }
  if (opts.features && opts.features.length) {
    return opts.features.map((f) => context(projectRoot, f).featureDir);
  }
  const featuresDir = path.join(projectRoot, '.v-flow', 'features');
  if (!fs.existsSync(featuresDir)) return [];
  return fs.readdirSync(featuresDir).sort().map((n) => path.join(featuresDir, n))
    .filter((p) => fs.existsSync(path.join(p, 'spec.md')) && fs.existsSync(path.join(p, 'tasks.md')));
}

function bench(projectRoot, opts = {}) {
  const config = loadSlicingConfig(projectRoot);
  const registry = getStrategyRegistry(projectRoot);
  const names = (opts.strategies && opts.strategies.length)
    ? opts.strategies
    : [...registry.keys()].filter((n) => n !== 'manual');
  const missing = names.filter((n) => !registry.has(n));
  if (missing.length > 0) throw new SliceError(`Không có strategy: ${missing.join(', ')}`, [], `Có: ${[...registry.keys()].join(', ')}`);
  const dirs = benchFeatureDirs(projectRoot, opts);
  if (dirs.length === 0) throw new SliceError('Không có feature nào để bench', [], 'Dùng --features a,b hoặc --fixtures <dir>');
  const features = dirs.map((d) => ({ name: path.basename(d), graph: buildGraph(d) }));
  const metrics = loadMetrics(projectRoot);
  let result;
  try {
    result = runBench({ features, strategies: names.map((n) => registry.get(n)), config, profile: opts.profile || config.active_profile, metrics, now: opts.now });
  } catch (err) {
    throw new SliceError(err.message);
  }
  return { result, metrics, text: render.renderBenchMd(result, metrics) };
}

module.exports = {
  SliceError,
  graph,
  brokenLines,
  strategies,
  commonParams,
  plan,
  importVsaf,
  sweep,
  check,
  show,
  compare,
  use,
  impact,
  mark,
  bench,
  sliceGate,
  violationLines,
};
