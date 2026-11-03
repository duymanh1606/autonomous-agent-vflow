/**
 * Planner — runs a strategy on a graph and turns the result into a variant:
 * resolve params → plan() on a frozen copy of the graph → schema check → normalize → provenance.
 */
const { assignUnits } = require('./assign-units');
const helpers = require('./helpers');
const { COMMON_PARAMS } = require('./strategy-registry');

const DEMO_PLACEHOLDER = 'TODO:';
const ACTIVE_STATUSES = ['in_progress', 'review', 'demo', 'done'];

const STRATEGY_HELPERS = Object.freeze({
  assignUnits,
  topoOrder: helpers.unitTopoOrder,
  pointsOf: helpers.pointsOf,
  flowsOf: helpers.flowsOf,
  flowPoints: helpers.flowPoints,
  mainFirstOrder: helpers.mainFirstOrder,
  hasTag: helpers.hasTag,
});

class StrategyError extends Error {
  constructor(strategyName, message) {
    super(`Strategy "${strategyName}": ${message}`);
    this.name = 'StrategyError';
    this.strategyName = strategyName;
  }
}

function coerce(key, def, raw) {
  if (raw === undefined || raw === null) return raw;
  let value = raw;
  if (def.type === 'number') {
    value = Number(raw);
    if (Number.isNaN(value)) throw new Error(`Tham số ${key} phải là số (nhận "${raw}")`);
  } else if (def.type === 'array') {
    value = Array.isArray(raw) ? raw.map(String) : String(raw).split(/[\s,]+/).filter(Boolean);
  } else if (def.type === 'boolean') {
    value = raw === true || raw === 'true';
  } else {
    value = String(raw);
  }
  if (def.enum && !def.enum.includes(value)) {
    throw new Error(`Tham số ${key} phải là một trong: ${def.enum.join(', ')} (nhận "${value}")`);
  }
  return value;
}

/** Defaults ← config.strategy_params[name] ← CLI params. Unknown keys are rejected. */
function resolveParams(strategy, cliParams = {}, config = {}) {
  const defs = { ...COMMON_PARAMS, ...(strategy.params || {}) };
  const result = {};
  for (const [k, def] of Object.entries(defs)) {
    result[k] = Array.isArray(def.default) ? [...def.default] : def.default;
  }
  const layers = [((config.strategy_params || {})[strategy.name]) || {}, cliParams];
  for (const layer of layers) {
    for (const [k, raw] of Object.entries(layer)) {
      if (!defs[k]) {
        throw new StrategyError(strategy.name, `tham số không hợp lệ "${k}" (có: ${Object.keys(defs).join(', ')})`);
      }
      try {
        result[k] = coerce(k, defs[k], raw);
      } catch (err) {
        throw new StrategyError(strategy.name, err.message);
      }
    }
  }
  return result;
}

function deepFreeze(obj) {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    Object.values(obj).forEach(deepFreeze);
  }
  return obj;
}

const isStrList = (v) => Array.isArray(v) && v.every((x) => typeof x === 'string');

/** @returns {string[]} schema errors (empty = valid) */
function validateVariantSchema(result) {
  const errors = [];
  if (!result || typeof result !== 'object') return ['kết quả phải là object { slices, deferred }'];
  if (!Array.isArray(result.slices) || result.slices.length === 0) {
    return ['`slices` phải là danh sách không rỗng'];
  }
  const ids = new Set();
  result.slices.forEach((s, i) => {
    const at = `slices[${i}]`;
    if (!s || typeof s !== 'object') { errors.push(`${at} phải là object`); return; }
    if (typeof s.id !== 'string' || !/^SLICE-\d+$/.test(s.id)) errors.push(`${at}.id phải có dạng SLICE-n`);
    else if (ids.has(s.id)) errors.push(`${at}.id trùng: ${s.id}`);
    else ids.add(s.id);
    for (const key of ['flows', 'units', 'depends_on']) {
      if (s[key] !== undefined && !isStrList(s[key])) errors.push(`${at}.${key} phải là danh sách chuỗi`);
    }
    for (const key of ['name', 'demo']) {
      if (s[key] !== undefined && s[key] !== null && typeof s[key] !== 'string') errors.push(`${at}.${key} phải là chuỗi`);
    }
    if (s.type !== undefined && s.type !== null && !['AFK', 'HITL'].includes(s.type)) errors.push(`${at}.type phải là AFK hoặc HITL`);
  });
  if (result.deferred !== undefined && !Array.isArray(result.deferred)) {
    errors.push('`deferred` phải là danh sách');
  } else {
    (result.deferred || []).forEach((d, i) => {
      if (typeof d !== 'string' && (!d || typeof d.flow !== 'string')) errors.push(`deferred[${i}] phải có trường flow`);
    });
  }
  return errors;
}

/** Fill defaults; a missing demo becomes a TODO placeholder that R4 reports. */
function normalizeVariantBody(result, graph) {
  const flowMap = new Map((graph.flows || []).map((f) => [f.id, f]));
  const slices = result.slices.map((s) => {
    const flows = [...(s.flows || [])];
    const first = flowMap.get(flows[0]);
    const label = first ? `${first.id}${first.title ? ` — ${first.title}` : ''}` : (s.name || s.id);
    return {
      id: s.id,
      name: s.name || label,
      flows,
      units: [...(s.units || [])],
      depends_on: [...(s.depends_on || [])],
      demo: s.demo && String(s.demo).trim() ? s.demo : `${DEMO_PLACEHOLDER} ${label}`,
      type: s.type || 'AFK',
    };
  });
  const deferred = (result.deferred || []).map((d) => (typeof d === 'string'
    ? { flow: d, reason: '' }
    : { flow: d.flow, reason: d.reason || '' }));
  return { slices, deferred };
}

/**
 * --keep-done: slices already started (in_progress/review/demo/done) keep their ID, flows and
 * tasks; the fresh plan only distributes what is left.
 */
function applyKeepDone(graph, fresh, oldVariant, statusById) {
  const kept = (oldVariant.slices || []).filter((s) => ACTIVE_STATUSES.includes(statusById[s.id]))
    .map((s) => JSON.parse(JSON.stringify(s)));
  if (kept.length === 0) return fresh;
  const keptFlows = new Set(kept.flatMap((s) => s.flows || []));
  const keptUnits = new Set(kept.flatMap((s) => s.units || []));
  const usedIds = new Set(kept.map((s) => s.id));
  let next = Math.max(...(oldVariant.slices || []).map((s) => Number(s.id.split('-')[1]) || 0)) + 1;
  const flowKey = (flows) => [...flows].sort().join(',');
  const oldIdByFlows = new Map((oldVariant.slices || [])
    .filter((s) => !usedIds.has(s.id) && (s.flows || []).length > 0)
    .map((s) => [flowKey(s.flows), s.id]));

  const rest = [];
  for (const s of fresh.slices) {
    const flows = s.flows.filter((f) => !keptFlows.has(f));
    const units = s.units.filter((u) => !keptUnits.has(u));
    if (flows.length === 0 && s.flows.length > 0) {
      // Every flow of this slice is already in a started slice: its new tasks reopen that slice (same ID)
      const home = kept.find((k) => (k.flows || []).some((f) => s.flows.includes(f)));
      home.units.push(...units);
      continue;
    }
    if (flows.length === 0 && units.length === 0) continue;
    let id = oldIdByFlows.get(flowKey(flows));
    if (s.id === helpers.FOUNDATION_ID && !usedIds.has(s.id)) id = s.id;
    if (!id || usedIds.has(id)) id = `SLICE-${next++}`;
    usedIds.add(id);
    rest.push({ ...s, id, flows, units });
  }

  const slices = [...kept, ...rest];
  const deps = helpers.deriveDepends(graph, slices);
  for (const s of rest) s.depends_on = deps.get(s.id);
  return {
    slices,
    deferred: fresh.deferred.filter((d) => !keptFlows.has(d.flow)),
  };
}

/**
 * Run a strategy and build a complete variant.
 * @param {object} opts
 * @param {string} opts.name - variant name
 * @param {object} opts.graph
 * @param {object} opts.strategy
 * @param {object} [opts.params] - resolved params (see resolveParams)
 * @param {object} [opts.source] - parsed YAML for the manual strategy
 * @param {string} [opts.createdBy] - cli | agent | manual
 * @param {string} [opts.now] - ISO timestamp
 * @param {object} [opts.keepDone] - { variant, statuses: { [sliceId]: status } }
 */
function buildVariant({ name, graph, strategy, params = {}, source = null, createdBy = 'cli', now, keepDone = null }) {
  let raw;
  try {
    const frozen = deepFreeze(JSON.parse(JSON.stringify(graph)));
    raw = strategy.plan(frozen, { ...params, ...(source ? { source } : {}) }, STRATEGY_HELPERS);
  } catch (err) {
    throw new StrategyError(strategy.name, err.message);
  }
  const errors = validateVariantSchema(raw);
  if (errors.length > 0) throw new StrategyError(strategy.name, `trả về sai schema — ${errors.join('; ')}`);

  let body = normalizeVariantBody(raw, graph);
  if (keepDone && keepDone.variant) body = applyKeepDone(graph, body, keepDone.variant, keepDone.statuses || {});

  const provenance = {
    strategy: strategy.name,
    params,
    graph_hash: graph.hash,
    spec_version: graph.spec_version,
    created_at: now || new Date().toISOString(),
    created_by: createdBy,
  };
  if (source && source.provenance) provenance.source_meta = source.provenance;
  if (keepDone && keepDone.variant) provenance.keep_done_from = keepDone.variant.variant || null;

  return { variant: name, provenance, slices: body.slices, deferred: body.deferred };
}

module.exports = {
  DEMO_PLACEHOLDER,
  ACTIVE_STATUSES,
  STRATEGY_HELPERS,
  StrategyError,
  resolveParams,
  validateVariantSchema,
  buildVariant,
};
