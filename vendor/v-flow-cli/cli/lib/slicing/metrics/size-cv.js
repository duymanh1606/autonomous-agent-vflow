/** size_cv: standard deviation / mean of slice points. */
const { slicePoints } = require('../helpers');

module.exports = {
  id: 'size_cv',
  name: 'Độ lệch kích thước (CV)',
  better: 'low',
  compute(graph, variant) {
    const pts = [...slicePoints(graph, variant).values()];
    if (pts.length < 2) return 0;
    const mean = pts.reduce((a, b) => a + b, 0) / pts.length;
    if (mean === 0) return 0;
    const sd = Math.sqrt(pts.reduce((acc, p) => acc + (p - mean) ** 2, 0) / pts.length);
    return Math.round((sd / mean) * 100) / 100;
  },
};
