/**
 * Impact by slice (UC-05).
 * Chain: changed step or REQ → flows holding the step + E/A flows branching from it → AC → task → slice.
 * Slices holding any of them get needs_recheck; their descendants get needs_regression.
 */
const { descendantsOf, deferredUnits } = require('./helpers');

const emptyChange = () => ({ steps: [], flows: [], reqs: [], acs: [], units: [] });

/**
 * Parse `UC-01:B2`, `UC-01.main`, `UC-01-E1`, `REQ-E01`, `AC-03`, `T-004` (comma separated).
 */
function parseChangeSpec(text) {
  const change = emptyChange();
  for (const raw of String(text || '').split(/[\s,]+/).filter(Boolean)) {
    let m;
    if ((m = raw.match(/^(UC-\d+):B?(\d+)$/i))) change.steps.push({ uc: m[1].toUpperCase(), step: `B${m[2]}` });
    else if (/^UC-\d+(\.main|-[EA]\d+)$/i.test(raw)) change.flows.push(raw.toUpperCase().replace(/\.MAIN$/, '.main'));
    else if (/^REQ-/i.test(raw)) change.reqs.push(raw.toUpperCase());
    else if (/^AC-\d+$/i.test(raw)) change.acs.push(raw.toUpperCase());
    else if (/^T-\d+$/i.test(raw)) change.units.push(raw.toUpperCase());
    else throw new Error(`Không hiểu thay đổi "${raw}" (dùng UC-01:B2, UC-01-E1, REQ-E01, AC-03, T-004)`);
  }
  return change;
}

/** Compare two graphs and describe what changed in the new one. */
function diffGraphs(oldGraph, newGraph) {
  const change = emptyChange();
  const added = { flows: [], units: [] };
  const removed = { flows: [], units: [] };
  const oldFlows = new Map((oldGraph.flows || []).map((f) => [f.id, f]));
  const newFlowIds = new Set((newGraph.flows || []).map((f) => f.id));

  for (const f of newGraph.flows || []) {
    const old = oldFlows.get(f.id);
    if (!old) {
      added.flows.push(f.id);
      change.flows.push(f.id);
    } else if (f.kind === 'main') {
      const steps = new Set([...Object.keys(f.step_digests || {}), ...Object.keys(old.step_digests || {})]);
      for (const step of steps) {
        if ((f.step_digests || {})[step] !== (old.step_digests || {})[step]) change.steps.push({ uc: f.uc, step });
      }
    } else if (f.digest !== old.digest || f.branches_from !== old.branches_from) {
      change.flows.push(f.id);
    }
  }
  for (const id of oldFlows.keys()) if (!newFlowIds.has(id)) removed.flows.push(id);

  const changedIds = (oldList, newList, bucket) => {
    const oldMap = new Map((oldList || []).map((x) => [x.id, x]));
    for (const x of newList || []) {
      const o = oldMap.get(x.id);
      if (!o || o.digest !== x.digest) bucket.push(x.id);
    }
  };
  changedIds(oldGraph.reqs, newGraph.reqs, change.reqs);
  changedIds(oldGraph.acs, newGraph.acs, change.acs);
  changedIds(oldGraph.units, newGraph.units, change.units);

  const oldUnitIds = new Set((oldGraph.units || []).map((u) => u.id));
  const newUnitIds = new Set((newGraph.units || []).map((u) => u.id));
  added.units = [...newUnitIds].filter((id) => !oldUnitIds.has(id));
  removed.units = [...oldUnitIds].filter((id) => !newUnitIds.has(id));

  return { change, added, removed };
}

/**
 * @param {object} graph - current graph
 * @param {object} variant
 * @param {object} change - { steps: [{uc, step}], flows, reqs, acs, units }
 */
function computeImpact(graph, variant, change) {
  const c = { ...emptyChange(), ...change };
  const flows = new Set(c.flows);
  for (const { uc, step } of c.steps) {
    flows.add(`${uc}.main`);
    for (const f of graph.flows || []) {
      if (f.uc === uc && f.kind !== 'main' && f.branches_from === step) flows.add(f.id);
    }
  }
  const reqs = new Set(c.reqs);
  const acs = new Set(c.acs);
  for (const a of graph.acs || []) {
    if ((a.flows || []).some((f) => flows.has(f)) || (a.reqs || []).some((r) => reqs.has(r))) acs.add(a.id);
  }
  const units = new Set(c.units);
  for (const u of graph.units || []) {
    if ((u.flows || []).some((f) => flows.has(f)) || (u.reqs || []).some((r) => reqs.has(r))) units.add(u.id);
  }
  for (const a of graph.acs || []) {
    if (acs.has(a.id)) (a.units || []).forEach((u) => units.add(u));
  }

  const recheck = (variant.slices || [])
    .filter((s) => (s.flows || []).some((f) => flows.has(f)) || (s.units || []).some((u) => units.has(u)))
    .map((s) => s.id);
  const regression = [...descendantsOf(variant, recheck)];

  const placed = new Set((variant.slices || []).flatMap((s) => s.units || []));
  const exempt = deferredUnits(graph, variant);
  const unassigned = (graph.units || []).map((u) => u.id).filter((id) => !placed.has(id) && !exempt.has(id));

  const sortIds = (list) => [...list].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  return {
    flows: sortIds(flows),
    acs: sortIds(acs),
    units: sortIds(units),
    recheck,
    regression,
    unassigned,
  };
}

/** Average number of slices reopened (recheck + regression) when one main-flow step changes. */
function reworkExposure(graph, variant) {
  const counts = [];
  for (const f of graph.flows || []) {
    if (f.kind !== 'main') continue;
    for (const step of f.steps || []) {
      const r = computeImpact(graph, variant, { steps: [{ uc: f.uc, step }] });
      counts.push(r.recheck.length + r.regression.length);
    }
  }
  if (counts.length === 0) return 0;
  return Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 100) / 100;
}

module.exports = { parseChangeSpec, diffGraphs, computeImpact, reworkExposure };
