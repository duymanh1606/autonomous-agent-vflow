/**
 * R8 size: the points of each slice are within [min_points, max_points].
 */
const { slicePoints } = require('../helpers');

module.exports = {
  id: 'R8-size',
  check(graph, variant, config = {}) {
    const { min_points: min = 2, max_points: max = 10 } = config.size || {};
    const points = slicePoints(graph, variant);
    const violations = [];
    for (const s of variant.slices || []) {
      const p = points.get(s.id);
      if (p < min) violations.push({ slice: s.id, message: `${s.id} có ${p} điểm < min_points ${min}` });
      if (p > max) violations.push({ slice: s.id, message: `${s.id} có ${p} điểm > max_points ${max}` });
    }
    return violations;
  },
};
