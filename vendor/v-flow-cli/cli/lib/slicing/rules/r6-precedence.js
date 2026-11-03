/**
 * R6 precedence (VSAF G8): a task that a task in slice S [DEPENDS] on must be in S or in an
 * ancestor of S.
 */
const { unitToSliceMap, ancestorsOf } = require('../helpers');

module.exports = {
  id: 'R6-precedence',
  check(graph, variant) {
    const violations = [];
    const where = unitToSliceMap(variant);
    for (const u of graph.units || []) {
      const s = where.get(u.id);
      if (!s) continue;
      const ancestors = ancestorsOf(variant, s);
      for (const d of u.depends || []) {
        const ds = where.get(d);
        if (ds && ds !== s && !ancestors.has(ds)) {
          violations.push({
            slice: s,
            units: [u.id, d],
            message: `${u.id} (${s}) phụ thuộc ${d} (${ds}), nhưng ${ds} không phải tổ tiên của ${s}`,
          });
        }
      }
    }
    return violations;
  },
};
