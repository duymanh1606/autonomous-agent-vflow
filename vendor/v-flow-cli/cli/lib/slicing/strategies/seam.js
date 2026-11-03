/**
 * Strategy: seam — closest to VSAF. Start from one flow, pull its tasks plus everything they
 * [DEPENDS] on, then cut at every enabled seam:
 *  - foundation: [FOUNDATION] tasks go to SLICE-0
 *  - ownership:  [EXTERNAL] tasks (and tasks that need them) go to a separate HITL slice
 *  - resilience: [RESILIENCE] tasks stay with their first consumer (never split off)
 *  - read-write: [WRITE:x] tasks are split from [READ:x] tasks of the same object
 */
const objectOf = (tag) => (tag.includes(':') ? tag.split(':')[1].trim().toLowerCase() : '*');

module.exports = {
  name: 'seam',
  description: 'Theo VSAF: bắt đầu từ một luồng, kéo task qua [DEPENDS], cắt tại các seam đang bật',
  params: {
    seams: { type: 'array', default: ['foundation', 'ownership', 'resilience'], description: 'foundation, ownership, resilience, read-write' },
  },

  plan(graph, params, helpers) {
    const seams = params.seams || [];
    const units = graph.units || [];
    const byId = new Map(units.map((u) => [u.id, u]));
    const isFoundation = (u) => seams.includes('foundation')
      && (helpers.hasTag(u, 'FOUNDATION') || (u.flows || []).length === 0);
    const taken = new Set(units.filter(isFoundation).map((u) => u.id));

    const dependsOnAny = (id, set, seen = new Set()) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return (byId.get(id).depends || []).some((d) => set.has(d) || dependsOnAny(d, set, seen));
    };
    // Move every unit of `part` that (transitively) needs one of `split` into `split`
    const cut = (part, splitIds) => {
      const split = new Set(splitIds);
      let moved = true;
      while (moved) {
        moved = false;
        for (const id of part) {
          if (!split.has(id) && dependsOnAny(id, split)) { split.add(id); moved = true; }
        }
      }
      return [part.filter((id) => !split.has(id)), part.filter((id) => split.has(id))];
    };

    const groups = [];
    for (const f of helpers.mainFirstOrder(graph)) {
      const closure = [];
      const stack = units.filter((u) => (u.flows || []).includes(f.id)).map((u) => u.id);
      while (stack.length > 0) {
        const id = stack.shift();
        if (taken.has(id) || closure.includes(id)) continue;
        closure.push(id);
        stack.push(...(byId.get(id).depends || []));
      }
      closure.forEach((id) => taken.add(id));
      const ordered = units.map((u) => u.id).filter((id) => closure.includes(id));

      let core = ordered;
      const extra = [];
      if (seams.includes('ownership')) {
        const ext = core.filter((id) => helpers.hasTag(byId.get(id), 'EXTERNAL'));
        if (ext.length > 0 && ext.length < core.length) {
          const [rest, split] = cut(core, ext);
          if (rest.length > 0) {
            core = rest;
            extra.push({ flows: [], units: split, type: 'HITL', name: `${f.id} — tích hợp ngoài` });
          }
        }
      }
      if (seams.includes('read-write')) {
        const tagsOf = (id, kind) => (byId.get(id).tags || []).filter((t) => t === kind || t.startsWith(`${kind}:`)).map(objectOf);
        const readObjs = new Set(core.flatMap((id) => tagsOf(id, 'READ')));
        const writes = core.filter((id) => tagsOf(id, 'WRITE').some((o) => readObjs.has(o) || readObjs.has('*') || o === '*'));
        if (readObjs.size > 0 && writes.length > 0) {
          const [rest, split] = cut(core, writes);
          if (rest.length > 0) {
            core = rest;
            extra.unshift({ flows: [], units: split, name: `${f.id} — ghi dữ liệu` });
          }
        }
      }
      groups.push({ flows: [f.id], units: core }, ...extra);
    }

    return helpers.assignUnits(graph, groups, {
      ...params,
      foundation: seams.includes('foundation') ? 'auto' : 'none',
    });
  },
};
