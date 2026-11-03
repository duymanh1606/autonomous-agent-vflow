/**
 * R11 type (VSAF G4): every slice is AFK or HITL; a slice holding an [EXTERNAL] task must be HITL.
 */
const { hasTag, unitMapOf } = require('../helpers');

module.exports = {
  id: 'R11-type',
  check(graph, variant) {
    const unitMap = unitMapOf(graph);
    const violations = [];
    for (const s of variant.slices || []) {
      if (!['AFK', 'HITL'].includes(s.type)) {
        violations.push({ slice: s.id, message: `${s.id} phải đánh dấu AFK hoặc HITL (đang là "${s.type}")` });
      }
      const ext = (s.units || []).filter((id) => unitMap.has(id) && hasTag(unitMap.get(id), 'EXTERNAL'));
      if (ext.length > 0 && s.type !== 'HITL') {
        violations.push({ slice: s.id, units: ext, message: `${s.id} chứa task [EXTERNAL] (${ext.join(', ')}) nên phải là HITL` });
      }
    }
    return violations;
  },
};
