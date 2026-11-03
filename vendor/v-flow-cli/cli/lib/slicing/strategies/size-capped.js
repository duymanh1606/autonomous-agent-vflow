/**
 * Strategy: size-capped — walk flows in order and fill a slice until max_points is reached.
 */
module.exports = {
  name: 'size-capped',
  description: 'Duyệt luồng theo thứ tự, gom vào slice đến khi chạm max_points',
  params: {
    max_points: { type: 'number', default: 8, description: 'Điểm tối đa của một slice' },
    order: { type: 'string', default: 'uc', enum: ['uc', 'topo'], description: 'uc = theo thứ tự trong spec; topo = luồng chính trước, rồi E/A theo bước rẽ' },
  },

  plan(graph, params, helpers) {
    const points = helpers.flowPoints(graph);
    const flows = params.order === 'topo' ? helpers.mainFirstOrder(graph) : helpers.flowsOf(graph);
    const groups = [];
    let current = null;
    let currentPts = 0;
    for (const f of flows) {
      const pts = points.get(f.id);
      if (!current || (current.length > 0 && currentPts + pts > params.max_points)) {
        current = [];
        groups.push(current);
        currentPts = 0;
      }
      current.push(f.id);
      currentPts += pts;
    }
    return helpers.assignUnits(graph, groups, params);
  },
};
