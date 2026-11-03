/** first_demo_points: points of the first slice (topo order) with a flow, plus all its ancestors. */
const { topoOrder, ancestorsOf, slicePoints } = require('../helpers');

module.exports = {
  id: 'first_demo_points',
  name: 'Điểm tới demo đầu tiên',
  better: 'low',
  compute(graph, variant) {
    const byId = new Map((variant.slices || []).map((s) => [s.id, s]));
    const first = topoOrder(variant).find((id) => (byId.get(id).flows || []).length > 0);
    if (!first) return 0;
    const pts = slicePoints(graph, variant);
    return [first, ...ancestorsOf(variant, first)].reduce((sum, id) => sum + (pts.get(id) || 0), 0);
  },
};
