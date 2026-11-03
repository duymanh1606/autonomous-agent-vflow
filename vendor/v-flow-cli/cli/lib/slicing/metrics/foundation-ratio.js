/** foundation_ratio: SLICE-0 points / total points. */
const { FOUNDATION_ID, slicePoints } = require('../helpers');

module.exports = {
  id: 'foundation_ratio',
  name: 'Tỷ lệ nền (SLICE-0)',
  better: 'low',
  compute(graph, variant) {
    const pts = slicePoints(graph, variant);
    const total = [...pts.values()].reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round(((pts.get(FOUNDATION_ID) || 0) / total) * 100) / 100;
  },
};
