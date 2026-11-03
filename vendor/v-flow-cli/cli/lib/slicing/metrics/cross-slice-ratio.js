/** cross_slice_ratio: [DEPENDS] edges joining two different slices / all [DEPENDS] edges. */
const { unitToSliceMap } = require('../helpers');

module.exports = {
  id: 'cross_slice_ratio',
  name: 'Tỷ lệ cạnh liên slice',
  better: 'low',
  compute(graph, variant) {
    const where = unitToSliceMap(variant);
    let total = 0;
    let cross = 0;
    for (const u of graph.units || []) {
      for (const d of u.depends || []) {
        if (!where.has(u.id) || !where.has(d)) continue;
        total++;
        if (where.get(u.id) !== where.get(d)) cross++;
      }
    }
    return total === 0 ? 0 : Math.round((cross / total) * 100) / 100;
  },
};
