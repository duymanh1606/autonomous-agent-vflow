/**
 * R1 unit-coverage (VSAF G1): every task belongs to exactly one slice.
 * A task whose flows are all deferred may stay outside every slice.
 */
const { deferredUnits } = require('../helpers');

module.exports = {
  id: 'R1-unit-coverage',
  check(graph, variant) {
    const violations = [];
    const exempt = deferredUnits(graph, variant);
    const seen = new Map((graph.units || []).map((u) => [u.id, []]));
    for (const s of variant.slices || []) {
      for (const u of s.units || []) {
        if (!seen.has(u)) {
          violations.push({ slice: s.id, units: [u], message: `${s.id} chứa task không tồn tại trong tasks.md: ${u}` });
          continue;
        }
        seen.get(u).push(s.id);
      }
    }
    for (const [u, list] of seen) {
      if (list.length === 0 && !exempt.has(u)) {
        violations.push({ slice: null, units: [u], message: `Task ${u} chưa thuộc slice nào` });
      } else if (list.length > 1) {
        violations.push({ slice: list[0], units: [u], message: `Task ${u} nằm ở nhiều slice: ${list.join(', ')}` });
      }
    }
    return violations;
  },
};
