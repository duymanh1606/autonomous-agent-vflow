/**
 * R5 dag (VSAF G3): depends_on points to existing slices and has no cycle.
 */
module.exports = {
  id: 'R5-dag',
  check(graph, variant) {
    const violations = [];
    const slices = variant.slices || [];
    const ids = new Set(slices.map((s) => s.id));
    const edges = new Map();
    for (const s of slices) {
      edges.set(s.id, []);
      for (const d of s.depends_on || []) {
        if (d === s.id) violations.push({ slice: s.id, message: `${s.id} phụ thuộc chính nó` });
        else if (!ids.has(d)) violations.push({ slice: s.id, message: `${s.id} phụ thuộc slice không tồn tại: ${d}` });
        else edges.get(s.id).push(d);
      }
    }
    const state = new Map(); // 1 = visiting, 2 = done
    const reported = new Set();
    const visit = (id, pathIds) => {
      state.set(id, 1);
      for (const d of edges.get(id)) {
        if (state.get(d) === 1) {
          const cycle = [...pathIds.slice(pathIds.indexOf(d)), d];
          const key = [...new Set(cycle)].sort().join(',');
          if (!reported.has(key)) {
            reported.add(key);
            violations.push({ slice: d, message: `Vòng phụ thuộc: ${cycle.join(' → ')}` });
          }
        } else if (!state.has(d)) {
          visit(d, [...pathIds, d]);
        }
      }
      state.set(id, 2);
    };
    for (const s of slices) if (!state.has(s.id)) visit(s.id, [s.id]);
    return violations;
  },
};
