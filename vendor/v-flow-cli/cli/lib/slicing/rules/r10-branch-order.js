/**
 * R10 branch-order: an E/A flow branching from step Bn is in the same slice as its main flow,
 * or in a descendant of that slice.
 */
const { flowToSliceMap, ancestorsOf } = require('../helpers');

module.exports = {
  id: 'R10-branch-order',
  check(graph, variant) {
    const where = flowToSliceMap(variant);
    const violations = [];
    for (const f of graph.flows || []) {
      if (f.kind === 'main') continue;
      const mainId = `${f.uc}.main`;
      const s = where.get(f.id);
      const ms = where.get(mainId);
      if (s && ms && s !== ms && !ancestorsOf(variant, s).has(ms)) {
        violations.push({ slice: s, flows: [f.id], message: `${f.id} (${s}) rẽ từ ${f.branches_from} của ${mainId} (${ms}) nhưng ${s} không phải hậu duệ của ${ms}` });
      }
    }
    return violations;
  },
};
