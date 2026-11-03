/**
 * Strategy: per-uc — each use case becomes one slice (coarsest baseline).
 */
module.exports = {
  name: 'per-uc',
  description: 'Mỗi UC một slice — mốc so sánh thô nhất',
  params: {},

  plan(graph, params, helpers) {
    const byUc = new Map();
    for (const f of helpers.flowsOf(graph)) {
      if (!byUc.has(f.uc)) byUc.set(f.uc, []);
      byUc.get(f.uc).push(f.id);
    }
    return helpers.assignUnits(graph, [...byUc.values()], params);
  },
};
