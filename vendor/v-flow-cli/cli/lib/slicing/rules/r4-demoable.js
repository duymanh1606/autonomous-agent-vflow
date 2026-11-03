/**
 * R4 demoable (VSAF G2): `demo` is filled in (not empty, not a TODO placeholder);
 * every slice except SLICE-0 serves at least one flow.
 */
const { FOUNDATION_ID } = require('../helpers');

module.exports = {
  id: 'R4-demoable',
  check(graph, variant) {
    const violations = [];
    for (const s of variant.slices || []) {
      const demo = String(s.demo || '').trim();
      if (!demo) {
        violations.push({ slice: s.id, message: `${s.id} thiếu câu demo` });
      } else if (/^TODO\b/i.test(demo)) {
        violations.push({ slice: s.id, message: `${s.id} có câu demo tạm "${demo}" — cần viết câu demo thật` });
      }
      if (s.id !== FOUNDATION_ID && (s.flows || []).length === 0) {
        violations.push({ slice: s.id, message: `${s.id} không phục vụ luồng nào (chỉ SLICE-0 được phép)` });
      }
    }
    return violations;
  },
};
