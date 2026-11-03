/**
 * Slicing helpers — pure functions shared by strategies, rules, metrics and impact.
 * None of these read or write files.
 */

const FOUNDATION_ID = 'SLICE-0';

function unitMapOf(graph) {
  return new Map((graph.units || []).map((u) => [u.id, u]));
}

function hasTag(unit, tag) {
  return (unit.tags || []).some((t) => t === tag || t.startsWith(`${tag}:`));
}

/** Sum of points for a list of unit IDs. */
function pointsOf(graph, unitIds) {
  const unitMap = unitMapOf(graph);
  return (unitIds || []).reduce((sum, id) => sum + ((unitMap.get(id) || {}).points || 0), 0);
}

/** Flows of the graph, optionally filtered by UC. */
function flowsOf(graph, uc = null) {
  return (graph.flows || []).filter((f) => !uc || f.uc === uc);
}

/** Estimated points per flow: each unit's points are split evenly across the flows it serves. */
function flowPoints(graph) {
  const result = new Map((graph.flows || []).map((f) => [f.id, 0]));
  for (const u of graph.units || []) {
    const flows = (u.flows || []).filter((f) => result.has(f));
    for (const f of flows) {
      result.set(f, result.get(f) + u.points / flows.length);
    }
  }
  return result;
}

function stepNumber(step) {
  const m = String(step || '').match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Flows ordered "main first": every main flow in UC order, then E/A flows by UC and branching step. */
function mainFirstOrder(graph) {
  const flows = graph.flows || [];
  const ucOrder = [...new Set(flows.map((f) => f.uc))];
  const mains = flows.filter((f) => f.kind === 'main');
  const branches = flows
    .filter((f) => f.kind !== 'main')
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (ucOrder.indexOf(a.f.uc) - ucOrder.indexOf(b.f.uc))
      || (stepNumber(a.f.branches_from) - stepNumber(b.f.branches_from))
      || (a.i - b.i))
    .map((x) => x.f);
  return [...mains, ...branches];
}

function unitToSliceMap(variant) {
  const map = new Map();
  for (const s of variant.slices || []) {
    for (const u of s.units || []) map.set(u, s.id);
  }
  return map;
}

function flowToSliceMap(variant) {
  const map = new Map();
  for (const s of variant.slices || []) {
    for (const f of s.flows || []) map.set(f, s.id);
  }
  return map;
}

/** Points of every slice: Map<sliceId, points>. */
function slicePoints(graph, variant) {
  const unitMap = unitMapOf(graph);
  const map = new Map();
  for (const s of variant.slices || []) {
    map.set(s.id, (s.units || []).reduce((sum, id) => sum + ((unitMap.get(id) || {}).points || 0), 0));
  }
  return map;
}

/** All ancestors (transitive depends_on) of a slice. Ignores unknown IDs and cycles. */
function ancestorsOf(variant, sliceId) {
  const byId = new Map((variant.slices || []).map((s) => [s.id, s]));
  const seen = new Set();
  const stack = [...((byId.get(sliceId) || {}).depends_on || [])];
  while (stack.length > 0) {
    const id = stack.pop();
    if (seen.has(id) || !byId.has(id)) continue;
    seen.add(id);
    stack.push(...(byId.get(id).depends_on || []));
  }
  seen.delete(sliceId);
  return seen;
}

/** All descendants (slices that transitively depend on any of the given slices). */
function descendantsOf(variant, sliceIds) {
  const roots = new Set(sliceIds);
  const result = new Set();
  for (const s of variant.slices || []) {
    if (roots.has(s.id)) continue;
    const anc = ancestorsOf(variant, s.id);
    if ([...roots].some((r) => anc.has(r))) result.add(s.id);
  }
  return result;
}

/**
 * Topological waves of slices (Kahn). Slices in a cycle or with unknown deps end up in no wave.
 * @returns {Array<Array<string>>}
 */
function topoWaves(variant) {
  const slices = variant.slices || [];
  const ids = new Set(slices.map((s) => s.id));
  const remaining = new Map(slices.map((s) => [s.id, new Set((s.depends_on || []).filter((d) => ids.has(d)))]));
  const waves = [];
  const done = new Set();
  while (remaining.size > 0) {
    const ready = slices.map((s) => s.id).filter((id) => remaining.has(id)
      && [...remaining.get(id)].every((d) => done.has(d)));
    if (ready.length === 0) break;
    for (const id of ready) {
      remaining.delete(id);
      done.add(id);
    }
    waves.push(ready);
  }
  return waves;
}

/** Slice IDs in topological order (stable by declaration order). */
function topoOrder(variant) {
  return topoWaves(variant).flat();
}

/**
 * Derive slice depends_on from the graph:
 *  - every slice depends on SLICE-0 when it exists,
 *  - unit [DEPENDS] edges that cross slices,
 *  - a slice depends on earlier slices holding tasks that serve its flows,
 *  - an E/A flow's slice depends on the slice of its main flow when the main slice comes earlier.
 * Then apply transitive reduction. Edges pointing to a later slice (by declaration order) are kept
 * only for [DEPENDS]; R5/R6 report any resulting problems.
 * @returns {Map<string, string[]>}
 */
function deriveDepends(graph, slices) {
  const order = new Map(slices.map((s, i) => [s.id, i]));
  const unitSlice = unitToSliceMap({ slices });
  const flowSlice = flowToSliceMap({ slices });
  const deps = new Map(slices.map((s) => [s.id, new Set()]));
  const hasFoundation = order.has(FOUNDATION_ID);

  for (const s of slices) {
    if (hasFoundation && s.id !== FOUNDATION_ID) deps.get(s.id).add(FOUNDATION_ID);
  }
  for (const u of graph.units || []) {
    const from = unitSlice.get(u.id);
    if (!from) continue;
    for (const d of u.depends || []) {
      const to = unitSlice.get(d);
      if (to && to !== from) deps.get(from).add(to);
    }
  }
  // A slice's flows are not demoable before the tasks serving them (placed in earlier slices) are done
  for (const u of graph.units || []) {
    const to = unitSlice.get(u.id);
    for (const f of u.flows || []) {
      const from = flowSlice.get(f);
      if (to && from && from !== to && order.get(to) < order.get(from)) deps.get(from).add(to);
    }
  }
  for (const f of graph.flows || []) {
    if (f.kind === 'main') continue;
    const from = flowSlice.get(f.id);
    const to = flowSlice.get(`${f.uc}.main`);
    if (from && to && from !== to && order.get(to) < order.get(from)) deps.get(from).add(to);
  }

  // Transitive reduction
  const reach = (start, target, skipDirect) => {
    const seen = new Set();
    const stack = [...deps.get(start)].filter((d) => d !== skipDirect);
    while (stack.length > 0) {
      const id = stack.pop();
      if (id === target) return true;
      if (seen.has(id) || !deps.has(id)) continue;
      seen.add(id);
      stack.push(...deps.get(id));
    }
    return false;
  };
  const result = new Map();
  for (const s of slices) {
    const direct = [...deps.get(s.id)];
    const kept = direct.filter((d) => !reach(s.id, d, d));
    result.set(s.id, kept.sort((a, b) => order.get(a) - order.get(b)));
  }
  return result;
}

/** Unit IDs in topological order of [DEPENDS] (stable by declaration order; cycles appended last). */
function unitTopoOrder(graph) {
  const units = graph.units || [];
  const ids = new Set(units.map((u) => u.id));
  const order = [];
  const done = new Set();
  let progress = true;
  while (progress) {
    progress = false;
    for (const u of units) {
      if (done.has(u.id)) continue;
      if ((u.depends || []).every((d) => done.has(d) || !ids.has(d))) {
        done.add(u.id);
        order.push(u.id);
        progress = true;
      }
    }
  }
  return [...order, ...units.map((u) => u.id).filter((id) => !done.has(id))];
}

/**
 * Units that may legitimately be outside every slice: all the flows they serve are deferred.
 */
function deferredUnits(graph, variant) {
  const deferred = new Set((variant.deferred || []).map((d) => (typeof d === 'string' ? d : d.flow)));
  return new Set((graph.units || [])
    .filter((u) => (u.flows || []).length > 0 && u.flows.every((f) => deferred.has(f)))
    .map((u) => u.id));
}

module.exports = {
  FOUNDATION_ID,
  unitMapOf,
  hasTag,
  pointsOf,
  flowsOf,
  flowPoints,
  stepNumber,
  mainFirstOrder,
  unitToSliceMap,
  flowToSliceMap,
  slicePoints,
  ancestorsOf,
  descendantsOf,
  topoWaves,
  topoOrder,
  unitTopoOrder,
  deriveDepends,
  deferredUnits,
};
