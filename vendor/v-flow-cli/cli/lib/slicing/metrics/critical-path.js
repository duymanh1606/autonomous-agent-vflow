/** critical_path: number of slices on the longest depends_on chain. */
const { topoOrder } = require('../helpers');

module.exports = {
  id: 'critical_path',
  name: 'Đường găng (số slice)',
  better: 'low',
  compute(graph, variant) {
    const byId = new Map((variant.slices || []).map((s) => [s.id, s]));
    const depth = new Map();
    for (const id of topoOrder(variant)) {
      const parents = (byId.get(id).depends_on || []).filter((d) => depth.has(d));
      depth.set(id, 1 + Math.max(0, ...parents.map((d) => depth.get(d))));
    }
    return Math.max(0, ...depth.values());
  },
};
