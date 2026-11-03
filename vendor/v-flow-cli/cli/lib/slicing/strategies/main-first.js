/**
 * Strategy: main-first — the main flow of every UC first (each its own slice), then E/A flows
 * grouped into later slices. Earliest possible happy-path demo.
 */
module.exports = {
  name: 'main-first',
  description: 'Luồng chính của mọi UC trước; luồng E/A gom thành slice sau',
  params: {
    group_alt: { type: 'string', default: 'per-uc', enum: ['per-uc', 'per-flow'], description: 'Gom luồng E/A theo UC hay mỗi luồng một slice' },
    defer: { type: 'array', default: [], description: 'Hoãn luồng: E, A hoặc ID luồng cụ thể' },
    max_points: { type: 'number', default: 0, description: 'Tách nhóm E/A khi vượt N điểm (0 = không giới hạn)' },
  },

  plan(graph, params, helpers) {
    const defer = params.defer || [];
    const isDeferred = (f) => defer.includes(f.id)
      || (defer.includes('E') && f.kind === 'exception')
      || (defer.includes('A') && f.kind === 'alternative');

    const ordered = helpers.mainFirstOrder(graph);
    const deferred = ordered.filter((f) => f.kind !== 'main' && isDeferred(f))
      .map((f) => ({ flow: f.id, reason: `main-first defer=${defer.join(',')}` }));
    const groups = ordered.filter((f) => f.kind === 'main').map((f) => [f.id]);

    const branches = ordered.filter((f) => f.kind !== 'main' && !isDeferred(f));
    if (params.group_alt === 'per-flow') {
      branches.forEach((f) => groups.push([f.id]));
    } else {
      const points = helpers.flowPoints(graph);
      let current = null;
      let currentUc = null;
      let currentPts = 0;
      for (const f of branches) {
        const pts = points.get(f.id);
        const overCap = params.max_points > 0 && current && currentPts + pts > params.max_points;
        if (!current || currentUc !== f.uc || overCap) {
          current = [];
          groups.push(current);
          currentUc = f.uc;
          currentPts = 0;
        }
        current.push(f.id);
        currentPts += pts;
      }
    }
    return helpers.assignUnits(graph, groups, { ...params, deferred });
  },
};
