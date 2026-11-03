/**
 * Strategy: per-flow — each flow becomes one slice (finest baseline).
 * merge_below: a flow smaller than N points joins the previous slice of the same UC.
 */
module.exports = {
  name: 'per-flow',
  description: 'Mỗi luồng một slice — mốc so sánh mịn nhất',
  params: {
    merge_below: { type: 'number', default: 0, description: 'Gộp luồng nhỏ hơn N điểm vào slice trước đó cùng UC' },
  },

  plan(graph, params, helpers) {
    const points = helpers.flowPoints(graph);
    const groups = [];
    let prevUc = null;
    for (const f of helpers.flowsOf(graph)) {
      const last = groups[groups.length - 1];
      if (params.merge_below > 0 && last && prevUc === f.uc && points.get(f.id) < params.merge_below) {
        last.push(f.id);
      } else {
        groups.push([f.id]);
      }
      prevUc = f.uc;
    }
    return helpers.assignUnits(graph, groups, params);
  },
};
