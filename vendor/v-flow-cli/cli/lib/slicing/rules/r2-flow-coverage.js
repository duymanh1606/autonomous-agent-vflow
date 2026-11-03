/**
 * R2 flow-coverage (VSAF G1): every flow belongs to exactly one slice, or is deferred with a reason.
 */
module.exports = {
  id: 'R2-flow-coverage',
  check(graph, variant) {
    const violations = [];
    const deferred = new Map((variant.deferred || []).map((d) => (typeof d === 'string' ? [d, ''] : [d.flow, d.reason || ''])));
    const seen = new Map((graph.flows || []).map((f) => [f.id, []]));
    for (const s of variant.slices || []) {
      for (const f of s.flows || []) {
        if (!seen.has(f)) {
          violations.push({ slice: s.id, flows: [f], message: `${s.id} chứa luồng không có trong spec: ${f}` });
          continue;
        }
        seen.get(f).push(s.id);
      }
    }
    for (const [f, reason] of deferred) {
      if (!seen.has(f)) violations.push({ slice: null, flows: [f], message: `deferred chứa luồng không có trong spec: ${f}` });
      else if (!String(reason).trim()) violations.push({ slice: null, flows: [f], message: `Luồng ${f} bị deferred nhưng thiếu lý do` });
    }
    for (const [f, list] of seen) {
      if (list.length === 0 && !deferred.has(f)) {
        violations.push({ slice: null, flows: [f], message: `Luồng ${f} không thuộc slice nào và không nằm trong deferred` });
      } else if (list.length > 1) {
        violations.push({ slice: list[0], flows: [f], message: `Luồng ${f} nằm ở nhiều slice: ${list.join(', ')}` });
      } else if (list.length === 1 && deferred.has(f)) {
        violations.push({ slice: list[0], flows: [f], message: `Luồng ${f} vừa ở ${list[0]} vừa nằm trong deferred` });
      }
    }
    return violations;
  },
};
