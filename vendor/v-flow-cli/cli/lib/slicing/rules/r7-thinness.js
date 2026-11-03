/**
 * R7 thinness (VSAF G6 + G7): no two tasks of one slice sit on both sides of an enabled seam.
 * Seams are enabled in config `seams:`; a seam whose tag is absent from tasks never fires.
 */
const { FOUNDATION_ID, hasTag, unitMapOf, unitToSliceMap } = require('../helpers');

const objectsOf = (unit, kind) => (unit.tags || [])
  .filter((t) => t === kind || t.startsWith(`${kind}:`))
  .map((t) => (t.includes(':') ? t.split(':')[1].trim().toLowerCase() : '*'));

module.exports = {
  id: 'R7-thinness',
  check(graph, variant, config = {}) {
    const violations = [];
    const seams = config.seams || ['foundation', 'ownership', 'resilience'];
    const unitMap = unitMapOf(graph);
    const where = unitToSliceMap(variant);
    const order = new Map((variant.slices || []).map((s, i) => [s.id, i]));

    // does `id` transitively depend on any unit in `targets`?
    const needs = (id, targets, seen = new Set()) => {
      if (seen.has(id) || !unitMap.has(id)) return false;
      seen.add(id);
      return (unitMap.get(id).depends || []).some((d) => targets.has(d) || needs(d, targets, seen));
    };

    for (const s of variant.slices || []) {
      const units = (s.units || []).map((id) => unitMap.get(id)).filter(Boolean);

      if (seams.includes('foundation') && s.id !== FOUNDATION_ID) {
        const found = units.filter((u) => hasTag(u, 'FOUNDATION'));
        if (found.length > 0 && units.some((u) => !hasTag(u, 'FOUNDATION') && (u.flows || []).length > 0)) {
          violations.push({ slice: s.id, units: found.map((u) => u.id), message: `[foundation] ${s.id} trộn task [FOUNDATION] (${found.map((u) => u.id).join(', ')}) với task phục vụ luồng — nên đưa về SLICE-0` });
        }
      }

      if (seams.includes('ownership')) {
        const ext = new Set(units.filter((u) => hasTag(u, 'EXTERNAL')).map((u) => u.id));
        const free = units.filter((u) => !ext.has(u.id) && !needs(u.id, ext));
        if (ext.size > 0 && free.length > 0) {
          violations.push({ slice: s.id, units: [...ext], message: `[ownership] ${s.id} gộp task [EXTERNAL] (${[...ext].join(', ')}) với task nội bộ tự demo được không cần nó (${free.map((u) => u.id).join(', ')})` });
        }
      }

      if (seams.includes('read-write')) {
        const reads = new Set(units.flatMap((u) => objectsOf(u, 'READ')));
        const writes = units.filter((u) => objectsOf(u, 'WRITE').some((o) => reads.has(o) || reads.has('*') || o === '*'));
        if (reads.size > 0 && writes.length > 0) {
          violations.push({ slice: s.id, units: writes.map((u) => u.id), message: `[read-write] ${s.id} chứa cả task [READ] và [WRITE] của cùng đối tượng` });
        }
      }
    }

    if (seams.includes('resilience')) {
      for (const u of graph.units || []) {
        if (!hasTag(u, 'RESILIENCE') || !where.has(u.id)) continue;
        const consumers = (graph.units || [])
          .filter((o) => (o.depends || []).includes(u.id) && where.has(o.id))
          .map((o) => where.get(o.id))
          .sort((a, b) => order.get(a) - order.get(b));
        if (consumers.length > 0 && consumers[0] !== where.get(u.id)) {
          violations.push({ slice: where.get(u.id), units: [u.id], message: `[resilience] ${u.id} phải nằm cùng slice với task đầu tiên dùng nó (${consumers[0]})` });
        }
      }
    }
    return violations;
  },
};
