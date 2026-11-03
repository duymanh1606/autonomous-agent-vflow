/**
 * assignUnits — shared by every strategy. A strategy only decides how flows are grouped;
 * this function places tasks into those groups:
 *  1. A task goes to the earliest slice containing a flow it serves.
 *  2. A task depended upon but not yet placed is pulled into the slice of the task that needs it.
 *  3. A dependency placed in a later slice is moved up to its dependent's slice (keeps R6 true).
 *  4. depends_on between slices is derived from [DEPENDS] (see helpers.deriveDepends).
 *
 * Common options: foundation: 'auto' | 'none', hub_policy: 'first-consumer' | 'own-slice', deferred.
 */
const { FOUNDATION_ID, hasTag, deriveDepends } = require('./helpers');

function normalizeGroup(group) {
  const g = Array.isArray(group) ? { flows: group } : { ...(group || {}) };
  return {
    flows: [...(g.flows || [])],
    units: [...(g.units || [])],
    name: g.name || '',
    demo: g.demo || '',
    type: g.type || null,
  };
}

function assignUnits(graph, groups = [], options = {}) {
  const foundation = options.foundation || 'auto';
  const hubPolicy = options.hub_policy || 'first-consumer';
  const units = graph.units || [];
  const flowMap = new Map((graph.flows || []).map((f) => [f.id, f]));
  const deferred = [...(options.deferred || [])];

  const specs = groups.map(normalizeGroup).filter((g) => g.flows.length > 0 || g.units.length > 0);
  const pinned = new Set(specs.flatMap((g) => g.units));

  // slices[i] = { spec, units: [] }; index 0 may be the foundation slice
  const slices = [];
  const where = new Map(); // unitId → slice object

  const place = (unitId, slice) => {
    const prev = where.get(unitId);
    if (prev === slice) return;
    if (prev) prev.units.splice(prev.units.indexOf(unitId), 1);
    slice.units.push(unitId);
    where.set(unitId, slice);
  };

  if (foundation === 'auto') {
    const foundationUnits = units.filter((u) => !pinned.has(u.id)
      && (hasTag(u, 'FOUNDATION') || (u.flows || []).length === 0));
    if (foundationUnits.length > 0) {
      const s = { foundation: true, spec: normalizeGroup({ name: 'Nền tảng' }), units: [] };
      slices.push(s);
      foundationUnits.forEach((u) => place(u.id, s));
    }
  }
  for (const spec of specs) {
    const s = { foundation: false, spec, units: [] };
    slices.push(s);
    spec.units.forEach((id) => { if (!where.has(id)) place(id, s); });
  }
  const indexOf = (s) => slices.indexOf(s);

  // 1. Earliest slice containing a served flow
  for (const u of units) {
    if (where.has(u.id)) continue;
    const target = slices.find((s) => !s.foundation && s.spec.flows.some((f) => (u.flows || []).includes(f)));
    if (target) place(u.id, target);
  }

  // 2 + 3. Pull unplaced dependencies; move later dependencies up. Indices only decrease → terminates.
  let changed = true;
  while (changed) {
    changed = false;
    for (const u of units) {
      const s = where.get(u.id);
      if (!s) continue;
      for (const d of u.depends || []) {
        const ds = where.get(d);
        if (!ds || indexOf(ds) > indexOf(s)) {
          place(d, s);
          changed = true;
        }
      }
    }
  }

  // Flowless tasks nobody needs (foundation: none) go to the first slice
  if (slices.length > 0) {
    for (const u of units) {
      if (!where.has(u.id) && (u.flows || []).length === 0) place(u.id, slices[0]);
    }
  }

  // Hub policy: tasks consumed by ≥ 2 slices get their own slice before the first consumer
  if (hubPolicy === 'own-slice') {
    const unitById = new Map(units.map((u) => [u.id, u]));
    const hubsByConsumer = new Map();
    for (const u of units) {
      const home = where.get(u.id);
      if (!home || home.foundation) continue;
      const consumers = new Set();
      for (const other of units) {
        if ((other.depends || []).includes(u.id) && where.has(other.id)) consumers.add(where.get(other.id));
      }
      for (const s of slices) {
        if (!s.foundation && s.spec.flows.some((f) => (u.flows || []).includes(f))) consumers.add(s);
      }
      if (consumers.size < 2) continue;
      const first = [...consumers].sort((a, b) => indexOf(a) - indexOf(b))[0];
      if (!hubsByConsumer.has(first)) hubsByConsumer.set(first, []);
      hubsByConsumer.get(first).push(u.id);
    }
    for (const [consumer, hubIds] of hubsByConsumer) {
      const hub = {
        foundation: false,
        spec: normalizeGroup({ name: `Hub dùng chung: ${hubIds.join(', ')}` }),
        units: [],
      };
      slices.splice(indexOf(consumer), 0, hub);
      const stack = [...hubIds];
      while (stack.length > 0) {
        const id = stack.pop();
        const s = where.get(id);
        if (s && s !== hub && indexOf(s) > indexOf(hub)) {
          place(id, hub);
          stack.push(...((unitById.get(id) || {}).depends || []));
        }
      }
    }
  }

  // Finalize IDs, names, types
  let counter = 1;
  const out = slices
    .filter((s) => s.foundation || s.units.length > 0 || s.spec.flows.length > 0)
    .map((s) => {
      const firstFlow = flowMap.get(s.spec.flows[0]);
      const name = s.spec.name
        || (firstFlow ? `${firstFlow.id}${firstFlow.title ? ` — ${firstFlow.title}` : ''}` : 'Slice');
      return {
        id: s.foundation ? FOUNDATION_ID : `SLICE-${counter++}`,
        name,
        flows: s.spec.flows,
        units: units.filter((u) => s.units.includes(u.id)).map((u) => u.id),
        depends_on: [],
        demo: s.spec.demo,
        type: s.spec.type,
      };
    });

  const deps = deriveDepends(graph, out);
  const unitById = new Map(units.map((u) => [u.id, u]));
  for (const s of out) {
    s.depends_on = deps.get(s.id);
    const external = s.units.some((id) => unitById.has(id) && hasTag(unitById.get(id), 'EXTERNAL'));
    s.type = external ? 'HITL' : (s.type || 'AFK');
  }

  return { slices: out, deferred };
}

module.exports = { assignUnits };
