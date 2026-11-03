/** uc_spread: average number of slices a UC is spread across. */
const { flowToSliceMap } = require('../helpers');

module.exports = {
  id: 'uc_spread',
  name: 'Số slice mỗi UC',
  better: null,
  compute(graph, variant) {
    const where = flowToSliceMap(variant);
    const byUc = new Map();
    for (const f of graph.flows || []) {
      if (!where.has(f.id)) continue;
      if (!byUc.has(f.uc)) byUc.set(f.uc, new Set());
      byUc.get(f.uc).add(where.get(f.id));
    }
    if (byUc.size === 0) return 0;
    const sum = [...byUc.values()].reduce((a, s) => a + s.size, 0);
    return Math.round((sum / byUc.size) * 100) / 100;
  },
};
