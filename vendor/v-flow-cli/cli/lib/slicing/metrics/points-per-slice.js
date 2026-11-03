/** points_per_slice: average and max points per slice. Compared by max. */
const { slicePoints } = require('../helpers');

module.exports = {
  id: 'points_per_slice',
  name: 'Điểm mỗi slice (TB / max)',
  better: 'low',
  compute(graph, variant) {
    const pts = [...slicePoints(graph, variant).values()];
    if (pts.length === 0) return { value: 0, display: '0 / 0' };
    const avg = Math.round((pts.reduce((a, b) => a + b, 0) / pts.length) * 10) / 10;
    const max = Math.max(...pts);
    return { value: max, display: `${avg} / ${max}` };
  },
};
